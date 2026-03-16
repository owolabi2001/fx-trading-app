import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as crypto from 'crypto';

@Injectable()
export class SnowflakeService {
  private readonly machineId: number;
  private sequence: number = 0;
  private lastTimestamp: number = -1;
  private readonly epoch = 1745107200000; // April 20, 2025

  constructor() {
    this.machineId = this.generateMachineId();
  }

  private generateMachineId(): number {
    const hostname = os.hostname();
    const hash = crypto.createHash('md5').update(hostname).digest('hex');
    const hashInt = parseInt(hash.slice(0, 4), 16);
    return hashInt % 1024;
  }

  generateId(): bigint {
    let timestamp = Date.now();

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & 0xfff;
      if (this.sequence === 0) {
        while (timestamp <= this.lastTimestamp) {
          timestamp = Date.now();
        }
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    const diff = BigInt(timestamp - this.epoch);
    const machine = BigInt(this.machineId);
    const seq = BigInt(this.sequence);

    return (diff << 22n) | (machine << 12n) | seq;
  }

  generateIdAsString(): string {
    return this.generateId().toString();
  }
}
