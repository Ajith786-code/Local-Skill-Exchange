// Development seed data. Usage:
//   npm run seed            -> sample users + skills
//   npm run seed:full       -> also sample exchange requests and chat messages
// Refuses to run when NODE_ENV=production. Only touches accounts ending in @seed.local.
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('./config/env');
const connectDB = require('./config/db');
const User = require('./models/User');
const ExchangeRequest = require('./models/ExchangeRequest');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const { prepareSkillList } = require('./services/skillService');

const SEED_PASSWORD = 'Password@123';
const withRequests = process.argv.includes('--with-requests');

const people = [
  { name: 'Rahul Sharma', email: 'rahul@seed.local', city: 'Vijayawada', bio: 'Weekend guitarist who needs to get better at spreadsheets.', mode: 'either', availability: 'Weekday evenings', offered: [{ name: 'Guitar', category: 'Music', level: 'advanced' }], wanted: [{ name: 'Excel', category: 'Business', level: 'beginner' }] },
  { name: 'Priya Nair', email: 'priya@seed.local', city: 'Vijayawada', bio: 'Finance analyst. Loves music and wants to learn an instrument.', mode: 'online', availability: 'Weekends', offered: [{ name: 'Excel', category: 'Business', level: 'expert' }], wanted: [{ name: 'Guitar', category: 'Music', level: 'beginner' }] },
  { name: 'Arjun Reddy', email: 'arjun@seed.local', city: 'Hyderabad', bio: 'Home cook who wants better food photos.', mode: 'in-person', availability: 'Saturday mornings', offered: [{ name: 'Cooking', category: 'Cooking', level: 'advanced' }], wanted: [{ name: 'Photography', category: 'Photography', level: 'beginner' }] },
  { name: 'Meera Iyer', email: 'meera@seed.local', city: 'Hyderabad', bio: 'Photographer who would love to cook more.', mode: 'either', availability: 'Sunday afternoons', offered: [{ name: 'Photography', category: 'Photography', level: 'advanced' }], wanted: [{ name: 'Cooking', category: 'Cooking', level: 'beginner' }] },
  { name: 'Karthik Rao', email: 'karthik@seed.local', city: 'Bengaluru', bio: 'Developer who teaches Python and wants to learn Spanish.', mode: 'online', availability: 'Late evenings', offered: [{ name: 'Python', category: 'Programming and Technology', level: 'expert' }, { name: 'Excel', category: 'Business', level: 'intermediate' }], wanted: [{ name: 'Spanish', category: 'Languages', level: 'beginner' }] },
  { name: 'Sneha Patel', email: 'sneha@seed.local', city: 'Vijayawada', bio: 'Spanish teacher who wants to learn Python.', mode: 'either', availability: 'Weekday mornings', offered: [{ name: 'Spanish', category: 'Languages', level: 'advanced' }, { name: 'Yoga', category: 'Fitness and Sports', level: 'intermediate' }], wanted: [{ name: 'Python', category: 'Programming and Technology', level: 'beginner' }] },
];

async function run() {
  if (config.isProd) {
    console.error('Refusing to seed: NODE_ENV is production.');
    process.exit(1);
  }
  await connectDB();

  const old = await User.find({ email: /@seed\.local$/ }).select('_id');
  const oldIds = old.map((u) => u._id);
  if (oldIds.length) {
    const reqs = await ExchangeRequest.find({ $or: [{ sender: { $in: oldIds } }, { receiver: { $in: oldIds } }] }).select('_id');
    const reqIds = reqs.map((r) => r._id);
    await Message.deleteMany({ request: { $in: reqIds } });
    await Notification.deleteMany({ $or: [{ recipient: { $in: oldIds } }, { relatedRequest: { $in: reqIds } }] });
    await ExchangeRequest.deleteMany({ _id: { $in: reqIds } });
    await User.deleteMany({ _id: { $in: oldIds } });
  }

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const users = {};
  for (const p of people) {
    const user = new User({ name: p.name, email: p.email, passwordHash, city: p.city, bio: p.bio, learningMode: p.mode, availability: p.availability });
    user.offeredSkills = await prepareSkillList(p.offered, user._id, 'offered');
    user.wantedSkills = await prepareSkillList(p.wanted, user._id, 'wanted');
    await user.save();
    users[p.email.split('@')[0]] = user;
  }
  console.log(`Created ${people.length} users.`);

  if (withRequests) {
    const make = (sender, receiver, offered, requested, status, extra = {}) =>
      ExchangeRequest.create({
        sender: sender._id, receiver: receiver._id,
        offeredSkill: offered, offeredSkillNormalized: offered.toLowerCase(),
        requestedSkill: requested, requestedSkillNormalized: requested.toLowerCase(),
        message: 'Hi! Want to swap skills?', status, isActive: ['pending', 'accepted'].includes(status), ...extra,
      });
    const accepted = await make(users.rahul, users.priya, 'Guitar', 'Excel', 'accepted', { respondedAt: new Date() });
    await make(users.arjun, users.meera, 'Cooking', 'Photography', 'pending');
    await Message.create([
      { request: accepted._id, sender: users.rahul._id, text: 'Hi Priya! When are you free for the first Guitar lesson?' },
      { request: accepted._id, sender: users.priya._id, text: 'Hey Rahul! Saturday works. Can we do Excel basics right after?' },
    ]);
    await Notification.create({ recipient: users.meera._id, type: 'request_received', message: 'Arjun Reddy wants to exchange Cooking for your Photography', relatedRequest: (await ExchangeRequest.findOne({ sender: users.arjun._id }))._id });
    console.log('Created sample requests and messages.');
  }

  console.log(`\nDevelopment logins (password for all: ${SEED_PASSWORD})`);
  people.forEach((p) => console.log(`  ${p.email}`));
  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
