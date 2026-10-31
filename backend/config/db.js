const mongoose = require('mongoose');
require('dotenv').config();
let pendingConnection;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Configure the backend environment.');
  if (!pendingConnection) {
    pendingConnection = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5, serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000
    }).then(() => mongoose.connection).finally(() => { pendingConnection = null; });
  }
  return pendingConnection;
};
module.exports = { connectDB, mongoose };
