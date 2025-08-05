import mongoose from 'mongoose';
import { logger } from '../utils/logger';

let connection: mongoose.Connection | null = null;

export const connectDB = async () => {
  if (connection) {
    return connection;
  }

  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nodeone';

    
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