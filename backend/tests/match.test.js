const { connectTestDb, clearDb, closeDb, registerUser, setSkills, createMutualPair } = require('./helpers');

beforeAll(connectTestDb);
beforeEach(clearDb);
afterAll(closeDb);

describe('mutual matching', () => {
  test('Rahul (Guitar -> Excel) and Priya (Excel -> Guitar) are mutual matches', async () => {
    const { rahul, priya } = await createMutualPair();
    const res = await rahul.get('/api/v1/matches');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    const match = res.body.data.items[0];
    expect(match.user.id).toBe(priya.user.id);
    expect(match.theyCanTeachYou.map((s) => s.name)).toEqual(['Excel']);
    expect(match.youCanTeachThem.map((s) => s.name)).toEqual(['Guitar']);
    expect(match.user.email).toBeUndefined();
  });

  test('one-sided overlaps are not mutual matches', async () => {
    const a = await registerUser();
    const b = await registerUser();
    await setSkills(a, ['Guitar'], ['Excel']);
    await setSkills(b, ['Excel'], ['Cooking']); // b teaches what a wants, but does not want Guitar
    const res = await a.get('/api/v1/matches');
    expect(res.body.data.items).toHaveLength(0);

    const detail = await a.get(`/api/v1/matches/${b.user.id}`);
    expect(detail.body.data.isMutual).toBe(false);
    expect(detail.body.data.theyCanTeachYou.map((s) => s.name)).toEqual(['Excel']);
  });

  test('matching is case-insensitive and users without skills get no matches', async () => {
    const a = await registerUser();
    const b = await registerUser();
    await setSkills(a, ['guitar'], ['EXCEL']);
    await setSkills(b, ['excel'], ['GUITAR']);
    expect((await a.get('/api/v1/matches')).body.data.items).toHaveLength(1);
    const empty = await registerUser();
    expect((await empty.get('/api/v1/matches')).body.data.items).toHaveLength(0);
  });

  test('dashboard statistics come from real data', async () => {
    const { rahul } = await createMutualPair();
    const res = await rahul.get('/api/v1/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.stats.mutualMatches).toBe(1);
    expect(res.body.data.stats.offeredSkills).toBe(1);
    expect(res.body.data.stats.pendingIncoming).toBe(0);
    expect(res.body.data.suggestedMatches).toHaveLength(1);
  });
});
