import { IntSharedEntity } from "src/common";
import { Column, Entity } from "typeorm";
import { ETokenType } from "../enums";

@Entity()
export class Token extends IntSharedEntity {
    @Column()
    token: string;

    @Column({ type: 'enum', enum: ETokenType })
    type: ETokenType;

    @Column({ type: 'bigint' })
    userId: bigint;

    @Column({ type: 'timestamp with time zone' })
    expiryDate: Date;
}