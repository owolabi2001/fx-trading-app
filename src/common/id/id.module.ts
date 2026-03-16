import { Global, Module } from '@nestjs/common';
import { SnowflakeService } from './services';

@Global()
@Module({
  providers: [SnowflakeService],
  exports: [SnowflakeService],
})
export class IdModule {}
