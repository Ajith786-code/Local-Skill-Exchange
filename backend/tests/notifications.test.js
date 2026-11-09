const { connectTestDb, clearDb, closeDb, patch, createMutualPair, sendRequest, registerUser } = require('./helpers');

beforeAll(connectTestDb);
beforeEach(clearDb);
afterAll(closeDb);

describe('notifications', () => {
  test('users only see their own notifications, can mark one or all as read', async () => {
    const { rahul, priya } = await createMutualPair();
    await sendRequest(rahul, priya);

    expect((await rahul.get('/api/v1/notifications')).body.data.items).toHaveLength(0);
    const list = await priya.get('/api/v1/notifications');
    expect(list.body.data.unreadCount).toBe(1);
    const note = list.body.data.items[0];
    expect(note.link).toBe('/requests?status=pending');

    const read = await patch(priya, `/api/v1/notifications/${note.id}/read`);
    expect(read.status).toBe(200);
    expect(read.body.data.unreadCount).toBe(0);

    const all = await patch(priya, '/api/v1/notifications/read-all');
    expect(all.status).toBe(200);
    expect(all.body.data.unreadCount).toBe(0);
  });

  test("a user cannot mark someone else's notification as read", async () => {
    const { rahul, priya } = await createMutualPair();
    await sendRequest(rahul, priya);
    const note = (await priya.get('/api/v1/notifications')).body.data.items[0];
    expect((await patch(rahul, `/api/v1/notifications/${note.id}/read`)).status).toBe(403);
    expect((await patch(rahul, '/api/v1/notifications/64b7f0f2a1b2c3d4e5f60718/read')).status).toBe(404);
    expect((await patch(rahul, '/api/v1/notifications/bad-id/read')).status).toBe(400);
    const stranger = await registerUser();
    expect((await stranger.get('/api/v1/notifications')).body.data.items).toHaveLength(0);
  });
});
