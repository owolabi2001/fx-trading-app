import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './services';

@Global()
@Module({
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
