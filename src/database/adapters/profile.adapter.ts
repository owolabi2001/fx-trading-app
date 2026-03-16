import { BaseAdapter } from 'src/common';
import { Profile } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileAdapter extends BaseAdapter<Profile> {
    constructor(
        @InjectRepository(Profile) profileRepository: Repository<Profile>,
    ) {
        super(profileRepository);
    }
}
