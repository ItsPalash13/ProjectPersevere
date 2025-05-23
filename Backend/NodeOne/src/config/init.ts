import { connectDB } from './database';
import { getAuth } from './auth';
import { logger } from '../utils/logger';

export const initializeApp = async () => {
    try {
        // Initialize database first
        await connectDB();
        // Then initialize auth
        await getAuth();
        logger.info('Application initialized successfully');
    } catch (err) {
        logger.error('Failed to initialize application:', err);
        process.exit(1);
    }
}; 