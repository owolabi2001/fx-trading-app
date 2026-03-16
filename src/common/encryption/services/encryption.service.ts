import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv } from 'crypto';
import { EEnvironmentConstants } from 'src/common';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor(configService: ConfigService) {
    const encryptionKey = configService.getOrThrow<string>(
      EEnvironmentConstants.encryptionKey,
    ); // 32 chars
    const iv = configService.getOrThrow<string>(
      EEnvironmentConstants.encryptionIV,
    ); // 16 chars

    this.key = Buffer.from(encryptionKey, 'utf8');
    this.iv = Buffer.from(iv, 'utf8');
  }

  encrypt(text: string): string {
    const cipher = createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText: string): string {
    const decipher = createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
