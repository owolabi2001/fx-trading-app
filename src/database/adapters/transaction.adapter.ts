import { BaseAdapter } from 'src/common';
import { Transaction } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionAdapter extends BaseAdapter<Transaction> {
    constructor(
        @InjectRepository(Transaction) transactionRepository: Repository<Transaction>,
    ) {
        super(transactionRepository);
    }
}
