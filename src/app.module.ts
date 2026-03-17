import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GetTypeOrmDataSourceConfig } from 'typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database';
import { EntityModule } from './modules';
import { CacheModule, IdModule } from './common';
import { MailModule } from './modules/mail';

@Module({
  imports: [
    MailModule,
    EntityModule,
    IdModule,
    CacheModule,
    DatabaseModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        GetTypeOrmDataSourceConfig(configService),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 6000,
        limit: 10,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
