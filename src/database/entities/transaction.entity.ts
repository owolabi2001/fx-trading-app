import { IntSharedEntity } from "src/common";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Wallet } from "./wallet.entity";
import { ETransactionPurpose, ETransactionStatus, ETransactionType } from "../enums";

@Entity()
export class Transaction extends IntSharedEntity {
    @ManyToOne(() => User, { onDelete: 'NO ACTION' })
    @JoinColumn({ referencedColumnName: 'id', name: 'userId' })
    user: User;

    @Column({ type: 'bigint' })
    userId: bigint;

    @ManyToOne(() => Wallet, { onDelete: 'NO ACTION' })
    @JoinColumn({ referencedColumnName: 'id', name: 'walletId' })
    wallet: Wallet;

    @Column({ type: 'bigint' })
    walletId: bigint;

    @Column({ type: 'enum', enum: ETransactionType })
    type: ETransactionType;

    @Column({ type: 'enum', enum: ETransactionPurpose })
    purpose: ETransactionPurpose;

    @Column({ type: 'decimal', precision: 15, scale: 4 })
    amount: number;

    @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
    rateUsed: number;

    @Column({ type: 'enum', enum: ETransactionStatus, default: ETransactionStatus.PENDING })
    status: ETransactionStatus;

    @Column()
    reference: string;
}