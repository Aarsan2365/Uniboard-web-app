// config/db.js
// MongoDB connection using Mongoose.

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is missing from backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
