const request = require('supertest');
const { connectTestDb, clearDb, closeDb, registerUser, patch, app } = require('./helpers');

beforeAll(connectTestDb);
beforeEach(clearDb);
afterAll(closeDb);

const valid = { name: 'Rahul', email: 'rahul@example.com', password: 'Password@123', city: 'Vijayawada' };

describe('registration', () => {
  test('registers a user, hides the password and sets an HttpOnly cookie', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('rahul@example.com');
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|Password@123/);
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
  });

  test('rejects a duplicate email (case-insensitive) with 409', async () => {
    await request(app).post('/api/v1/auth/register').send(valid);
    const res = await request(app).post('/api/v1/auth/register').send({ ...valid, email: 'RAHUL@example.com' });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('rejects weak passwords with 422', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ ...valid, password: 'password' });
    expect(res.status).toBe(422);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('rejects NoSQL-injection style objects in the body', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(res.status).toBe(422);
  });
});

describe('login / session', () => {
  test('logs in with valid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(valid);
    const res = await request(app).post('/api/v1/auth/login').send({ email: valid.email, password: valid.password });
    expect(res.status).toBe(200);
    expect(res.body.data.csrfToken).toBeTruthy();
  });

  test('rejects wrong password and unknown email with the same message', async () => {
    await request(app).post('/api/v1/auth/register').send(valid);
    const wrong = await request(app).post('/api/v1/auth/login').send({ email: valid.email, password: 'Wrong@1234' });
    const unknown = await request(app).post('/api/v1/auth/login').send({ email: 'nobody@example.com', password: 'Wrong@1234' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  test('protected endpoints require authentication', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect((await request(app).get('/api/v1/users/me')).status).toBe(401);
    expect((await request(app).get('/api/v1/notifications')).status).toBe(401);
  });

  test('restores the session via /auth/me and logs out', async () => {
    const agent = await registerUser();
    const me = await agent.get('/api/v1/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.csrfToken).toBe(agent.csrf);

    const out = await agent.post('/api/v1/auth/logout');
    expect(out.status).toBe(200);
    expect((await agent.get('/api/v1/auth/me')).status).toBe(401);
  });

  test('state-changing requests without the CSRF header are refused', async () => {
    const agent = await registerUser();
    const res = await agent.patch('/api/v1/users/me').send({ bio: 'hello' });
    expect(res.status).toBe(403);
    const ok = await patch(agent, '/api/v1/users/me', { bio: 'hello' });
    expect(ok.status).toBe(200);
  });

  test('unknown routes return a JSON 404', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
