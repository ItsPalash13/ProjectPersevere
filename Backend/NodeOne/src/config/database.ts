import mongoose from 'mongoose';
import { logger } from '../utils/logger';

let connection: mongoose.Connection | null = null;

export const connectDB = async () => {
  if (connection) {
    return connection;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nodeone';
    console.log('=== DATABASE CONNECTION DEBUG ===');
    console.log('MongoDB URI:', mongoURI);
    console.log('All environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      PORT: process.env.PORT,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'SET' : 'NOT SET',
      FRONTEND_URL: process.env.FRONTEND_URL
    });
    console.log('=== END DEBUG ===');
    
    const conn = await mongoose.connect(mongoURI);
    connection = conn.connection;
    logger.info('MongoDB Connected');
    return connection;
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`MongoDB Connection Error: ${err.message}`);
    }
    process.exit(1);
  }
}; 