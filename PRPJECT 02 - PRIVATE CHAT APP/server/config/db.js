'use strict';

const mongoose = require('mongoose');

let mongoServerInstance = null;
let isConnecting = false;
let isCleaningUp = false;

const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  const uri = process.env.MONGO_URI;

  // Try Atlas first with a tight 2s timeout
  if (uri) {
    try {
      console.log('[Database] Attempting connection to primary MongoDB Atlas...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000
      });
      console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}`);
      isConnecting = false;
      return;
    } catch (primaryErr) {
      console.warn(`[Database] Primary MongoDB Atlas connection failed (${primaryErr.message}).`);
    }
  }

  // Fallback: in-memory server
  console.log('[Database] Initializing MongoDB in-memory server fallback for seamless local execution...');
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    if (!mongoServerInstance) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'private_chat_app',
          launchTimeout: 60000
        }
      });
    }

    const memoryUri = mongoServerInstance.getUri();
    await mongoose.connect(memoryUri, {
      dbName: 'private_chat_app'
    });
    console.log(`[Database] Connected to In-Memory MongoDB at ${memoryUri}`);
  } catch (memErr) {
    console.error('[Database] Failed to connect to In-Memory MongoDB:', memErr);
    process.exit(1);
  } finally {
    isConnecting = false;
  }

  // Only log errors — DO NOT attempt to reconnect; nodemon will restart the whole process
  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    // During nodemon restarts the MongoMemoryServer's mongod is killed by the OS.
    // Do NOT try to reconnect here — that causes the ECONNREFUSED spam loop.
    // The process will be restarted fresh by nodemon.
    if (!isCleaningUp) {
      console.warn('[Database] MongoDB disconnected (nodemon restart or transient loss). Process will restart.');
    }
  });
};

const disconnectDB = async () => {
  isCleaningUp = true;
  try {
    await mongoose.disconnect();
    if (mongoServerInstance) {
      await mongoServerInstance.stop();
      mongoServerInstance = null;
    }
  } catch (e) {
    console.warn('[Database] Disconnect error:', e.message);
  }
};

// ── Graceful shutdown on nodemon restart (SIGUSR2) ───────────────────────────
// nodemon sends SIGUSR2 before killing the process; we must stop MongoMemoryServer
// so it releases its port, preventing EADDRINUSE on the next start.
process.once('SIGUSR2', async () => {
  console.log('[Database] SIGUSR2 received (nodemon restart) — shutting down cleanly...');
  await disconnectDB();
  process.kill(process.pid, 'SIGUSR2');
});

process.once('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

process.once('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB };
