import { IntSharedEntity, SharedEntity } from 'src/common';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Profile extends IntSharedEntity {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    user: User;

    @Column({ nullable: true })
    picture: string;

    @Column({ type: 'varchar', length: 11, nullable: true, select: false })
    @Exclude()
    bvn: string;

    @Column({ type: 'varchar', length: 11, nullable: true, select: false })
    @Exclude()
    nin: string;
}
