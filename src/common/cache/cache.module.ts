import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisCacheService } from './services';
import { REDIS_CLIENT } from './redis.constants';
import { ConfigService } from '@nestjs/config';
import { EEnvironmentConstants } from '../constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>(EEnvironmentConstants.redisHost),
          port: configService.get<number>(EEnvironmentConstants.redisPort),
          password:
            configService.get<string>(EEnvironmentConstants.nodeEnv) ==
              'production'
              ? configService.get<string>(EEnvironmentConstants.redisPassword)
              : undefined,
          username:
            configService.get<string>(EEnvironmentConstants.nodeEnv) ==
              'production'
              ? configService.get<string>(EEnvironmentConstants.redisUsername)
              : undefined
        });
      },
    },
    RedisCacheService,
  ],
  exports: [REDIS_CLIENT, RedisCacheService],
})
export class CacheModule { }
