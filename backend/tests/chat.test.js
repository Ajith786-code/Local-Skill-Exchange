const http = require('http');
const { io: connectClient } = require('socket.io-client');
const { connectTestDb, clearDb, closeDb, registerUser, post, patch, createMutualPair, sendRequest, app } = require('./helpers');
const { initSocket } = require('../src/sockets/chatSocket');
const Message = require('../src/models/Message');

beforeAll(connectTestDb);
beforeEach(clearDb);
afterAll(closeDb);

async function acceptedPair() {
  const { rahul, priya } = await createMutualPair();
  const id = (await sendRequest(rahul, priya)).body.data.request.id;
  await patch(priya, `/api/v1/requests/${id}/accept`);
  return { rahul, priya, id };
}

describe('REST chat', () => {
  test('participants can send messages that are stored in MongoDB', async () => {
    const { rahul, priya, id } = await acceptedPair();
    const sent = await post(rahul, `/api/v1/requests/${id}/messages`, { text: '  Hello <b>Priya</b>  ' });
    expect(sent.status).toBe(201);
    expect(sent.body.data.message.text).toBe('Hello <b>Priya</b>'); // stored as text; React escapes it when rendering
    expect(await Message.countDocuments({ request: id })).toBe(1);

    const history = await priya.get(`/api/v1/requests/${id}/messages`);
    expect(history.status).toBe(200);
    expect(history.body.data.items).toHaveLength(1);
    expect(history.body.data.items[0].sender.id).toBe(rahul.user.id);
  });

  test('recipient gets a notification when not viewing the chat', async () => {
    const { rahul, priya, id } = await acceptedPair();
    await post(rahul, `/api/v1/requests/${id}/messages`, { text: 'ping' });
    const notes = await priya.get('/api/v1/notifications');
    expect(notes.body.data.items.map((n) => n.type)).toContain('new_message');
  });

  test('rejects empty and over-long messages', async () => {
    const { rahul, id } = await acceptedPair();
    expect((await post(rahul, `/api/v1/requests/${id}/messages`, { text: '   ' })).status).toBe(422);
    expect((await post(rahul, `/api/v1/requests/${id}/messages`, { text: 'a'.repeat(1001) })).status).toBe(422);
  });

  test('non-participants cannot read or write', async () => {
    const { id } = await acceptedPair();
    const outsider = await registerUser();
    expect((await outsider.get(`/api/v1/requests/${id}/messages`)).status).toBe(403);
    expect((await post(outsider, `/api/v1/requests/${id}/messages`, { text: 'hi' })).status).toBe(403);
  });

  test('chat is unavailable for pending, rejected and cancelled requests', async () => {
    const { rahul, priya } = await createMutualPair();
    const id = (await sendRequest(rahul, priya)).body.data.request.id;
    expect((await post(rahul, `/api/v1/requests/${id}/messages`, { text: 'hi' })).status).toBe(403);
    await patch(priya, `/api/v1/requests/${id}/reject`);
    expect((await rahul.get(`/api/v1/requests/${id}/messages`)).status).toBe(403);
  });

  test('completed exchanges keep a read-only history', async () => {
    const { rahul, priya, id } = await acceptedPair();
    await post(rahul, `/api/v1/requests/${id}/messages`, { text: 'before completion' });
    await patch(rahul, `/api/v1/requests/${id}/complete`);
    await patch(priya, `/api/v1/requests/${id}/complete`);
    expect((await priya.get(`/api/v1/requests/${id}/messages`)).body.data.items).toHaveLength(1);
    expect((await post(priya, `/api/v1/requests/${id}/messages`, { text: 'more' })).status).toBe(403);
  });

  test('history is paginated with a bounded limit', async () => {
    const { rahul, id } = await acceptedPair();
    for (let i = 0; i < 5; i += 1) await post(rahul, `/api/v1/requests/${id}/messages`, { text: `m${i}` });
    const page = await rahul.get(`/api/v1/requests/${id}/messages`).query({ limit: 2 });
    expect(page.body.data.items.map((m) => m.text)).toEqual(['m3', 'm4']);
    expect(page.body.data.hasMore).toBe(true);
    expect((await rahul.get(`/api/v1/requests/${id}/messages`).query({ limit: 500 })).status).toBe(422);
  });
});

describe('Socket.IO chat authorization', () => {
  let server;
  let port;

  beforeAll((done) => {
    server = http.createServer(app);
    initSocket(server);
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  const connect = (cookie) =>
    new Promise((resolve, reject) => {
      const socket = connectClient(`http://localhost:${port}`, { extraHeaders: cookie ? { cookie } : {}, reconnection: false, transports: ['polling'] });
      socket.on('connect', () => resolve(socket));
      socket.on('connect_error', (err) => {
        socket.close();
        reject(err);
      });
    });
  const emit = (socket, event, payload) => new Promise((resolve) => socket.emit(event, payload, resolve));

  test('rejects connections without a valid cookie', async () => {
    await expect(connect(null)).rejects.toThrow(/Authentication/);
  });

  test('participants can join and exchange real-time messages; outsiders cannot join', async () => {
    const { rahul, priya, id } = await acceptedPair();
    const outsider = await registerUser();

    const rahulSocket = await connect(rahul.cookieHeader);
    const priyaSocket = await connect(priya.cookieHeader);
    const outsiderSocket = await connect(outsider.cookieHeader);

    expect((await emit(rahulSocket, 'chat:join', { requestId: id })).ok).toBe(true);
    expect((await emit(priyaSocket, 'chat:join', { requestId: id })).ok).toBe(true);
    const denied = await emit(outsiderSocket, 'chat:join', { requestId: id });
    expect(denied.ok).toBe(false);

    const received = new Promise((resolve) => priyaSocket.on('message:new', resolve));
    const ack = await emit(rahulSocket, 'chat:send', { requestId: id, text: 'live hello' });
    expect(ack.ok).toBe(true);
    expect((await received).text).toBe('live hello');
    expect((await emit(outsiderSocket, 'chat:send', { requestId: id, text: 'intrude' })).ok).toBe(false);
    expect(await Message.countDocuments({ request: id })).toBe(1);

    [rahulSocket, priyaSocket, outsiderSocket].forEach((s) => s.close());
  });
});
