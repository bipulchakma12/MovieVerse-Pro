import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn('⚠️ MONGODB_URI is not defined. Running in mock/offline mode.');
      return;
    }

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Error:");
    console.error(error.stack || error);
    console.log('ℹ️ Server will continue operating with client-side demo state.');
  }
};
