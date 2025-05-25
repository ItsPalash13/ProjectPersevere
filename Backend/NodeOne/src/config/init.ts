import { connectDB } from './database';
import { getAuth } from './auth';
import { logger } from '../utils/logger';
import { connectRedis } from './redis';
import redisClient from './redis';
import { initializeSocket } from './socket';
import { Express } from 'express';

export const initializeApp = async (app: Express) => {
    try {
        // Initialize database first
        await connectDB();
        // Then initialize auth
        await getAuth();
        logger.info('Database connected successfully');
        await connectRedis();
        logger.info('Redis connected successfully');
        
        // Get server from app and initialize Socket.IO
        const server = app.get('server');
        if (!server) {
            throw new Error('Server not found in Express app');
        }
        await initializeSocket(server);
        logger.info('Socket.IO initialized successfully');
    } catch (err) {
        logger.error('Failed to initialize application:', err);
        process.exit(1);
    }
}; 