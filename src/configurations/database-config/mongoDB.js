const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clouddocs';

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[database] MongoDB connected');
  } catch (err) {
    console.error('[database] MongoDB connection error:', err.message);
    throw err;
  }
}

module.exports = { connectMongo, mongoose };
