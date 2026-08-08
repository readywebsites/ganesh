import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/surat_ganesh_mahotsav';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with fast timeout, graceful fallback, and Atlas / Local compatibility.
 * Returns mongoose connection or null if database is offline or unreachable.
 */
async function dbConnect() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000, // 3s timeout for fast failover
      connectTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('[MongoDB] Connected successfully to database.');
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn(`[MongoDB Warning] Unable to connect to database (${err.message || 'Offline'}). Operating in graceful fallback mode.`);
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.warn(`[MongoDB Exception] Database connection error: ${e.message || 'Offline'}`);
    cached.promise = null;
    cached.conn = null;
  }

  return cached.conn;
}

export default dbConnect;
