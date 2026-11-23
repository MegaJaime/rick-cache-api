import { Redis } from 'ioredis';
import { redisClient } from '../config/redis';

class CacheService {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async getCachedCharacters(key: string): Promise<string | null> {
    const result = await this.client.get(key);
    return result ?? null;
  }

  async setCachedCharacters(key: string, value: string, expirationInSeconds: number): Promise<string | null> {
    return this.client.set(key, value, 'EX', expirationInSeconds);
  }

  async invalidateCharactersCache(): Promise<void> {
    if (this.client.status !== 'ready') {
      return;
    }

    const keys = await this.client.keys('characters:*');
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}

const cacheService = new CacheService(redisClient);

export const getCachedCharacters = cacheService.getCachedCharacters.bind(cacheService);
export const setCachedCharacters = cacheService.setCachedCharacters.bind(cacheService);
export const invalidateCharactersCache = cacheService.invalidateCharactersCache.bind(cacheService);
