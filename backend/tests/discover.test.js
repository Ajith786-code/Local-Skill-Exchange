const { connectTestDb, clearDb, closeDb, registerUser, patch, setSkills } = require('./helpers');

beforeAll(connectTestDb);
beforeEach(clearDb);
afterAll(closeDb);

async function seedPeople() {
  const me = await registerUser({ name: 'Searcher', city: 'Vijayawada' });
  const a = await registerUser({ name: 'Anita Guitar', city: 'Hyderabad' });
  const b = await registerUser({ name: 'Bala Cook', city: 'Vijayawada' });
  await setSkills(a, ['Guitar'], ['Cooking']);
  await patch(b, '/api/v1/users/me', { learningMode: 'online', offeredSkills: [{ name: 'Cooking', category: 'Cooking', level: 'expert' }] });
  return { me, a, b };
}

describe('find skills', () => {
  test('excludes the current user and never returns email addresses', async () => {
    const { me } = await seedPeople();
    const res = await me.get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(res.body.data.items.map((u) => u.name).sort()).toEqual(['Anita Guitar', 'Bala Cook']);
    expect(JSON.stringify(res.body)).not.toMatch(/@example\.com/);
  });

  test('searches by skill name and by user name (case-insensitive)', async () => {
    const { me } = await seedPeople();
    const bySkill = await me.get('/api/v1/users').query({ q: 'GUITAR' });
    expect(bySkill.body.data.items).toHaveLength(1);
    const byName = await me.get('/api/v1/users').query({ q: 'bala' });
    expect(byName.body.data.items[0].name).toBe('Bala Cook');
  });

  test('filters by city, category, mode and level', async () => {
    const { me } = await seedPeople();
    expect((await me.get('/api/v1/users').query({ city: 'hyder' })).body.data.items).toHaveLength(1);
    expect((await me.get('/api/v1/users').query({ category: 'Cooking' })).body.data.items.map((u) => u.name)).toContain('Bala Cook');
    expect((await me.get('/api/v1/users').query({ mode: 'online' })).body.data.items.map((u) => u.name)).toContain('Bala Cook');
    expect((await me.get('/api/v1/users').query({ level: 'expert' })).body.data.items).toHaveLength(1);
  });

  test('paginates and handles pages past the end', async () => {
    const { me } = await seedPeople();
    const p1 = await me.get('/api/v1/users').query({ limit: 1, page: 1 });
    expect(p1.body.data.items).toHaveLength(1);
    expect(p1.body.data.pagination.totalPages).toBe(2);
    const far = await me.get('/api/v1/users').query({ limit: 1, page: 50 });
    expect(far.status).toBe(200);
    expect(far.body.data.items).toHaveLength(0);
  });

  test('rejects invalid or injected query parameters', async () => {
    const { me } = await seedPeople();
    expect((await me.get('/api/v1/users?page=0')).status).toBe(422);
    expect((await me.get('/api/v1/users?q[$ne]=x')).status).toBe(422);
    expect((await me.get('/api/v1/users?category=Nope')).status).toBe(422);
  });

  test('empty results are a normal 200', async () => {
    const { me } = await seedPeople();
    const res = await me.get('/api/v1/users').query({ q: 'zzzzzz' });
    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });
});
