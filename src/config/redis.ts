import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const retryStrategy = (times: number) => {
  if (times > 20) {
    return null;
  }
  return Math.min(times * 200, 3000);
};

const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      retryStrategy,
    })
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      retryStrategy,
    });

redisClient.on('error', (err: Error) => {
  console.error('Redis error:', err.message);
});

const initializeRedis = async (): Promise<void> => {
  if (redisClient.status === 'ready') {
    return;
  }

  await redisClient.connect();
  console.log('Connected to Redis');
};

export { redisClient, initializeRedis };
