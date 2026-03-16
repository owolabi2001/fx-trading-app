import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async set(key: string, value: any, ttlInSeconds?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttlInSeconds) {
      await this.redis.set(key, stringValue, 'EX', ttlInSeconds);
    } else {
      await this.redis.set(key, stringValue);
    }
    this.logger.log(`Successfully cached data with key: ${key}`);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    this.logger.log(`Successfully retrieved details for key: ${key}`);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string): Promise<number> {
    this.logger.log(`Successfully deleted cache for key: ${key}`);
    return this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }

  async flushAll(): Promise<'OK'> {
    return this.redis.flushall();
  }

  async keys(pattern = '*'): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
