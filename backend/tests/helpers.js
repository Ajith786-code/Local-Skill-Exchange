const mongoose = require('mongoose');
const request = require('supertest');
const connectDB = require('../src/config/db');
const app = require('../src/app');

let counter = 0;

async function connectTestDb() {
  await connectDB();
  // Safety net: never wipe a database that is not clearly a test database.
  if (!/test/i.test(mongoose.connection.name)) {
    throw new Error(`Refusing to run tests against database "${mongoose.connection.name}" (name must contain "test").`);
  }
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

async function clearDb() {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

async function closeDb() {
  await mongoose.connection.close();
}

// Registers a user and returns a supertest agent that keeps the auth cookie and CSRF token.
async function registerUser(overrides = {}) {
  counter += 1;
  const agent = request.agent(app);
  const data = {
    name: `Test User ${counter}`,
    email: `user${counter}-${Date.now()}@example.com`,
    password: 'Password@123',
    city: 'Vijayawada',
    ...overrides,
  };
  const res = await agent.post('/api/v1/auth/register').send(data);
  if (res.status !== 201) throw new Error(`registerUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  agent.csrf = res.body.data.csrfToken;
  agent.user = res.body.data.user;
  agent.credentials = data;
  agent.cookieHeader = res.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
  return agent;
}

const post = (agent, url, body = {}) => agent.post(url).set('X-CSRF-Token', agent.csrf).send(body);
const patch = (agent, url, body = {}) => agent.patch(url).set('X-CSRF-Token', agent.csrf).send(body);
const del = (agent, url, body = {}) => agent.delete(url).set('X-CSRF-Token', agent.csrf).send(body);

const setSkills = (agent, offered, wanted) =>
  patch(agent, '/api/v1/users/me', {
    offeredSkills: offered.map((name) => ({ name })),
    wantedSkills: wanted.map((name) => ({ name })),
  });

// Rahul teaches Guitar & wants Excel; Priya teaches Excel & wants Guitar.
async function createMutualPair() {
  const rahul = await registerUser({ name: 'Rahul' });
  const priya = await registerUser({ name: 'Priya' });
  await setSkills(rahul, ['Guitar'], ['Excel']);
  await setSkills(priya, ['Excel'], ['Guitar']);
  return { rahul, priya };
}

async function sendRequest(sender, receiver, offeredSkill = 'Guitar', requestedSkill = 'Excel') {
  return post(sender, '/api/v1/requests', { receiverId: receiver.user.id, offeredSkill, requestedSkill, message: 'Hello!' });
}

module.exports = { connectTestDb, clearDb, closeDb, registerUser, post, patch, del, setSkills, createMutualPair, sendRequest, app };
