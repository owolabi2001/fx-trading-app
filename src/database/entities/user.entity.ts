import { Exclude } from 'class-transformer';
import { IntSharedEntity } from 'src/common';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Wallet } from './wallet.entity';

@Entity()
export class User extends IntSharedEntity {
  @Column()
  @Index({ unique: true })
  email: string;

  @Column({ select: false })
  @Exclude()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLogin: Date;
}
