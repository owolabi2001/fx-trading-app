import { Exclude } from 'class-transformer';
import { IntSharedEntity } from 'src/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity()
export class User extends IntSharedEntity {
  @Column()
  @Index({ unique: true })
  email: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({ default: false })
  isActivated: boolean;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile: Profile;
}
