import { BaseAdapter } from 'src/common';
import { Wallet } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletAdapter extends BaseAdapter<Wallet> {
    constructor(
        @InjectRepository(Wallet) walletRepository: Repository<Wallet>,
    ) {
        super(walletRepository);
    }
}
