const { connectTestDb, clearDb, closeDb, registerUser, post, patch, createMutualPair, sendRequest } = require('./helpers');

beforeAll(connectTestDb);
beforeEach(clearDb);
afterAll(closeDb);

describe('sending requests', () => {
  test('sends a request and notifies the receiver', async () => {
    const { rahul, priya } = await createMutualPair();
    const res = await sendRequest(rahul, priya);
    expect(res.status).toBe(201);
    expect(res.body.data.request.status).toBe('pending');

    const notes = await priya.get('/api/v1/notifications');
    expect(notes.body.data.unreadCount).toBe(1);
    expect(notes.body.data.items[0].type).toBe('request_received');
  });

  test('rejects duplicate active requests (both directions) with 409', async () => {
    const { rahul, priya } = await createMutualPair();
    await sendRequest(rahul, priya);
    expect((await sendRequest(rahul, priya)).status).toBe(409);
    expect((await sendRequest(priya, rahul, 'Excel', 'Guitar')).status).toBe(409);
  });

  test('rejects requests to yourself and with skills not in the profiles', async () => {
    const { rahul, priya } = await createMutualPair();
    expect((await sendRequest(rahul, rahul)).status).toBe(400);
    expect((await sendRequest(rahul, priya, 'Piano', 'Excel')).status).toBe(422);
    expect((await sendRequest(rahul, priya, 'Guitar', 'Cooking')).status).toBe(422);
  });

  test('unknown receiver returns 404', async () => {
    const { rahul } = await createMutualPair();
    const res = await post(rahul, '/api/v1/requests', { receiverId: '64b7f0f2a1b2c3d4e5f60718', offeredSkill: 'Guitar', requestedSkill: 'Excel' });
    expect(res.status).toBe(404);
  });
});

describe('status transitions', () => {
  test('receiver accepts; sender is notified', async () => {
    const { rahul, priya } = await createMutualPair();
    const id = (await sendRequest(rahul, priya)).body.data.request.id;
    const res = await patch(priya, `/api/v1/requests/${id}/accept`);
    expect(res.status).toBe(200);
    expect(res.body.data.request.status).toBe('accepted');
    const notes = await rahul.get('/api/v1/notifications');
    expect(notes.body.data.items.map((n) => n.type)).toContain('request_accepted');
  });

  test('only the receiver can accept or reject; only the sender can cancel', async () => {
    const { rahul, priya } = await createMutualPair();
    const id = (await sendRequest(rahul, priya)).body.data.request.id;
    expect((await patch(rahul, `/api/v1/requests/${id}/accept`)).status).toBe(403);
    expect((await patch(rahul, `/api/v1/requests/${id}/reject`)).status).toBe(403);
    expect((await patch(priya, `/api/v1/requests/${id}/cancel`)).status).toBe(403);
  });

  test('outsiders cannot view or modify a request', async () => {
    const { rahul, priya } = await createMutualPair();
    const outsider = await registerUser();
    const id = (await sendRequest(rahul, priya)).body.data.request.id;
    expect((await outsider.get(`/api/v1/requests/${id}`)).status).toBe(403);
    expect((await patch(outsider, `/api/v1/requests/${id}/accept`)).status).toBe(403);
    expect((await outsider.get('/api/v1/requests')).body.data.items).toHaveLength(0);
  });

  test('invalid transitions are refused with 409', async () => {
    const { rahul, priya } = await createMutualPair();
    const id = (await sendRequest(rahul, priya)).body.data.request.id;
    await patch(priya, `/api/v1/requests/${id}/accept`);
    expect((await patch(priya, `/api/v1/requests/${id}/reject`)).status).toBe(409);
    expect((await patch(rahul, `/api/v1/requests/${id}/cancel`)).status).toBe(409);
    expect((await patch(priya, `/api/v1/requests/${id}/accept`)).status).toBe(409);
  });

  test('cannot complete a pending request', async () => {
    const { rahul, priya } = await createMutualPair();
    const id = (await sendRequest(rahul, priya)).body.data.request.id;
    expect((await patch(rahul, `/api/v1/requests/${id}/complete`)).status).toBe(409);
  });

  test('sender cancels a pending request, and a new request becomes possible', async () => {
    const { rahul, priya } = await createMutualPair();
    const id = (await sendRequest(rahul, priya)).body.data.request.id;
    expect((await patch(rahul, `/api/v1/requests/${id}/cancel`)).body.data.request.status).toBe('cancelled');
    expect((await sendRequest(rahul, priya)).status).toBe(201);
  });

  test('exchange completes only after BOTH participants confirm', async () => {
    const { rahul, priya } = await createMutualPair();
    const id = (await sendRequest(rahul, priya)).body.data.request.id;
    await patch(priya, `/api/v1/requests/${id}/accept`);

    const first = await patch(rahul, `/api/v1/requests/${id}/complete`);
    expect(first.body.data.request.status).toBe('accepted');
    expect((await patch(rahul, `/api/v1/requests/${id}/complete`)).status).toBe(409);

    const second = await patch(priya, `/api/v1/requests/${id}/complete`);
    expect(second.body.data.request.status).toBe('completed');
  });

  test('lists requests with per-status counts', async () => {
    const { rahul, priya } = await createMutualPair();
    await sendRequest(rahul, priya);
    const res = await priya.get('/api/v1/requests').query({ box: 'incoming', status: 'pending' });
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.counts.pending).toBe(1);
  });
});
