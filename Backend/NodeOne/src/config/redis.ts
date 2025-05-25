import { createClient } from '@redis/client';
import { promisify } from 'util';
import { logger } from '../utils/logger';
const redisClient = createClient({
    username: 'default',
    password: 'UtiB1wDs7fpAveKIVpGtIP0ZuuqTFV6E',
    socket: {
        host: 'redis-17057.c92.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 17057
    }
});

// Promisify Redis commands
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);

export const connectRedis = async () => {          
  // Connect to Redis
  await redisClient.connect().catch(console.error);

// Handle Redis events
redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

redisClient.on('error', (err: Error) => {
  logger.error('Redis error:', err);
});

redisClient.on('reconnecting', () => {
  logger.info('Reconnecting to Redis...');
});
}

// Session management functions
export const setSession = async (key: string, value: any, expirySeconds?: number) => {
  try {
    const stringValue = JSON.stringify(value);
    await setAsync(key, stringValue);
    if (expirySeconds) {
      await expireAsync(key, expirySeconds);
    }
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

export const getSession = async (key: string) => {
  try {
    const value = await getAsync(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const deleteSession = async (key: string) => {
  try {
    await delAsync(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

export const updateSessionExpiry = async (key: string, expirySeconds: number) => {
  try {
    await expireAsync(key, expirySeconds);
    return true;
  } catch (error) {
    console.error('Redis expiry update error:', error);
    return false;
  }
};

export default redisClient;
