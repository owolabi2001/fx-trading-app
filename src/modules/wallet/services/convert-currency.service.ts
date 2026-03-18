import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { ConvertCurrencyDto } from "../dtos";
import { FXService } from "src/modules/fx/services";
import { ECurrencyType, Transaction, Wallet } from "src/database";
import { GetWalletService } from "./get-wallet.service";
import { SnowflakeService } from "src/common";
import { DataSource, QueryRunner } from "typeorm";
import { ETransactionPurpose, ETransactionStatus, ETransactionType } from "src/database/enums";

@Injectable()
export class ConvertCurrencyService {
    private readonly logger = new Logger(ConvertCurrencyService.name);

    constructor(
        private readonly fxService: FXService,
        private readonly getWalletService: GetWalletService,
        private readonly dataSource: DataSource,
        private readonly snowflakeService: SnowflakeService,
    ) { }

    async execute(userId: string, data: ConvertCurrencyDto) {
        const { fromCurrency, toCurrency, amount } = data;

        const { fromWallet, toWallet } = await this.getWalletService.getCustomerWallets(
            BigInt(userId),
            fromCurrency,
            toCurrency
        );

        const { conversion_rate: rate } = await this.fxService.getPairConversions(fromCurrency, toCurrency);
        const toAmount = rate * amount;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const lockedFromWallet = await this.lockWallet(queryRunner, fromWallet.id);
            const lockedToWallet = await this.lockWallet(queryRunner, toWallet.id);

            if (lockedFromWallet.balance < amount) {
                throw new UnprocessableEntityException(`Insufficient balance in ${fromCurrency} wallet`);
            }

            await this.debitWallet(queryRunner, lockedFromWallet, amount);
            await this.creditWallet(queryRunner, lockedToWallet, toAmount);

            await this.createTransaction(queryRunner, {
                userId: BigInt(userId),
                walletId: lockedFromWallet.id,
                type: ETransactionType.DEBIT,
                amount,
                rate,
            });

            await this.createTransaction(queryRunner, {
                userId: BigInt(userId),
                walletId: lockedToWallet.id,
                type: ETransactionType.CREDIT,
                amount: toAmount,
                rate,
            });

            await queryRunner.commitTransaction();
            this.logger.log(`Conversion successful for user ${userId}: ${amount} ${fromCurrency} -> ${toAmount} ${toCurrency}`);

            return {
                message: 'Currency conversion successful',
                from: { currency: fromCurrency, debited: amount },
                to: { currency: toCurrency, credited: toAmount },
                rate,
            };

        } catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Conversion failed for user ${userId}`, err);
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    private async lockWallet(queryRunner: QueryRunner, walletId: bigint) {
        return queryRunner.manager.findOneOrFail(Wallet, {
            where: { id: walletId },
            lock: { mode: 'pessimistic_write' },
        });
    }

    private async debitWallet(queryRunner: QueryRunner, wallet: Wallet, amount: number) {
        await queryRunner.manager.update(Wallet, wallet.id, {
            balance: Number(wallet.balance) - amount,
        });
    }

    private async creditWallet(queryRunner: QueryRunner, wallet: Wallet, amount: number) {
        await queryRunner.manager.update(Wallet, wallet.id, {
            balance: Number(wallet.balance) + amount,
        });
    }

    private async createTransaction(
        queryRunner: QueryRunner,
        data: {
            userId: bigint;
            walletId: bigint;
            type: ETransactionType;
            amount: number;
            rate: number;
        }
    ) {
        await queryRunner.manager.save(Transaction, {
            id: this.snowflakeService.generateId(),
            userId: data.userId,
            walletId: data.walletId,
            type: data.type,
            purpose: ETransactionPurpose.CONVERSION,
            amount: data.amount,
            rateUsed: data.rate,
            status: ETransactionStatus.SUCCESS,
            reference: `FX-TXN-${this.snowflakeService.generateId().toString()}`,
        });
    }
}