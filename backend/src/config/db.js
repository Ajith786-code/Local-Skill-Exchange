const mongoose = require('mongoose');
const config = require('./env');

mongoose.set('strictQuery', true);

async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    if (!config.isTest) console.log(`[db] MongoDB connected (database: ${mongoose.connection.name})`);
  } catch (err) {
    console.error('\n[db] Could not connect to MongoDB.');
    console.error(`[db] Reason: ${err.message}`);
    console.error('[db] Fix: make sure the MongoDB server is running (Windows: Services -> "MongoDB Server" -> Start)');
    console.error('[db]      or set MONGODB_URI in backend/.env to a MongoDB Atlas connection string.\n');
    throw err;
  }
}

module.exports = connectDB;
