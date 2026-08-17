const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment config.
 *
 * Design note: this does NOT crash the process if the initial connection
 * fails. In local dev you may start the server before Mongo is running -
 * we log a clear warning instead of killing the whole app, since the
 * health check route (Day 1) has no DB dependency. From Day 3 onward,
 * routes that actually need the DB will fail gracefully via the error
 * handler if the connection genuinely never comes up.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[db] MONGODB_URI is not set - skipping DB connection.');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[db] Connected to MongoDB');
  } catch (err) {
    console.error('[db] Failed to connect to MongoDB:', err.message);
    console.warn('[db] Server will continue running without a DB connection.');
  }

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected.');
  });
}

module.exports = connectDB;
