import { IntSharedEntity } from "src/common";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from "typeorm";
import { User } from "./user.entity";
import { ECurrencyType } from "../enums";
import { Transaction } from "./transaction.entity";

@Entity()
@Unique(['user', 'currency'])
export class Wallet extends IntSharedEntity {

    @Column({ type: 'enum', enum: ECurrencyType, default: ECurrencyType.Naira })
    currency: ECurrencyType;

    @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
    balance: number;

    @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
    @JoinColumn({ referencedColumnName: 'id', name: 'userId' })
    user: User;

    @Column({ type: 'bigint', nullable: true })
    userId: bigint;

    @OneToMany(() => Transaction, (transaction) => transaction.wallet)
    transactions: Transaction[];
}