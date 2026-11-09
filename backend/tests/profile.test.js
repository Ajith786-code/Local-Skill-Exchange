const { connectTestDb, clearDb, closeDb, registerUser, patch, del } = require('./helpers');

beforeAll(connectTestDb);
beforeEach(clearDb);
afterAll(closeDb);

describe('profile', () => {
  test('updates profile fields and normalizes skills', async () => {
    const agent = await registerUser();
    const res = await patch(agent, '/api/v1/users/me', {
      bio: 'Hi there',
      city: 'Hyderabad',
      learningMode: 'online',
      offeredSkills: [{ name: '  guitar   lessons ', category: 'Music', level: 'advanced' }],
      wantedSkills: [{ name: 'EXCEL' }],
    });
    expect(res.status).toBe(200);
    expect(res.body.data.user.city).toBe('Hyderabad');
    expect(res.body.data.user.offeredSkills[0].normalized).toBe('guitar lessons');
    expect(res.body.data.user.wantedSkills[0].normalized).toBe('excel');
  });

  test('rejects case-insensitive duplicate skills in the same list', async () => {
    const agent = await registerUser();
    const res = await patch(agent, '/api/v1/users/me', { offeredSkills: [{ name: 'Guitar' }, { name: ' guitar ' }] });
    expect(res.status).toBe(422);
  });

  test('ignores fields that must not be changed (mass assignment)', async () => {
    const agent = await registerUser();
    await patch(agent, '/api/v1/users/me', { email: 'hacker@example.com', passwordHash: 'x', bio: 'ok' });
    const me = await agent.get('/api/v1/users/me');
    expect(me.body.data.user.email).toBe(agent.user.email);
    expect(me.body.data.user.bio).toBe('ok');
  });

  test('cannot modify or delete another user', async () => {
    const a = await registerUser();
    const b = await registerUser();
    expect((await patch(a, `/api/v1/users/${b.user.id}`, { bio: 'pwned' })).status).toBe(403);
    expect((await del(a, `/api/v1/users/${b.user.id}`, { password: 'Password@123' })).status).toBe(403);
  });

  test('public profile never exposes email or password data', async () => {
    const a = await registerUser();
    const b = await registerUser();
    const res = await a.get(`/api/v1/users/${b.user.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
  });

  test('invalid ObjectId returns 400 and missing user 404', async () => {
    const a = await registerUser();
    expect((await a.get('/api/v1/users/not-an-id')).status).toBe(400);
    expect((await a.get('/api/v1/users/64b7f0f2a1b2c3d4e5f60718')).status).toBe(404);
  });

  test('account deletion requires the right password and removes the user', async () => {
    const agent = await registerUser();
    expect((await del(agent, '/api/v1/users/me', { password: 'Wrong@1234' })).status).toBe(403);
    expect((await del(agent, '/api/v1/users/me', { password: 'Password@123' })).status).toBe(200);
    expect((await agent.get('/api/v1/auth/me')).status).toBe(401);
  });
});
