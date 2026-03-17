import { Injectable, Logger } from "@nestjs/common";
import { GetWalletService } from "./get-wallet.service";
import { FundWalletDto } from "../dtos";
import { DataSource, QueryRunner } from "typeorm";
import { SnowflakeService } from "src/common";
import { Transaction, Wallet } from "src/database";
import { ETransactionPurpose, ETransactionStatus, ETransactionType } from "src/database/enums";

@Injectable()
export class FundWalletService {
    private readonly logger = new Logger(FundWalletService.name);
    constructor(
        private readonly getWalletService: GetWalletService,
        private readonly dataSource: DataSource,
        private readonly snowflakeService: SnowflakeService,
    ) { }

    async execute(userId: bigint, { amount, currency }: FundWalletDto) {
        const wallet = await this.getWalletService.validate(userId, currency);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await this.updateWalletBalance(queryRunner, wallet, amount);
            const transaction = await this.createTransactionRecord(queryRunner, userId, wallet, amount);

            await queryRunner.commitTransaction();

            this.logger.log(`Wallet funded successfully for user ${userId}. Transaction ID: ${transaction.id}`);

            return {
                message: "Wallet funded successfully",
                transactionId: transaction.id.toString(),
                reference: transaction.reference,
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to fund wallet for user ${userId}: ${error.message}`);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async updateWalletBalance(queryRunner: QueryRunner, wallet: Wallet, amount: number) {
        wallet.balance = Number(wallet.balance) + Number(amount);
        await queryRunner.manager.update(Wallet, wallet.id, { balance: wallet.balance });
    }

    private async createTransactionRecord(queryRunner: QueryRunner, userId: bigint, wallet: Wallet, amount: number) {
        const reference = `FX-TXN-${this.snowflakeService.generateId().toString()}`;
        return await queryRunner.manager.save(Transaction, {
            id: this.snowflakeService.generateId(),
            userId,
            walletId: wallet.id,
            type: ETransactionType.CREDIT,
            purpose: ETransactionPurpose.FUNDING,
            amount,
            status: ETransactionStatus.SUCCESS,
            reference,
        });
    }
}