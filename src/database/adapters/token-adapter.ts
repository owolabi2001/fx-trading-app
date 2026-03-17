import { BaseAdapter } from 'src/common';
import { Token } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenAdapter extends BaseAdapter<Token> {
  constructor(@InjectRepository(Token) tokenRepository: Repository<Token>) {
    super(tokenRepository);
  }
}
