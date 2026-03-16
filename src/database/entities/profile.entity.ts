import { SharedEntity } from 'src/common';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile extends SharedEntity {
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
}
