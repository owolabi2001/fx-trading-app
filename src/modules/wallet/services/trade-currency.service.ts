// src/modules/wallet/services/trade.service.ts
import { BadRequestException, Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { DataSource, QueryRunner } from "typeorm";
import { TradeDto } from "../dtos/trade.dto";
import { ECurrencyType, Transaction, Wallet } from "src/database";
import { ETransactionPurpose, ETransactionStatus, ETransactionType } from "src/database/enums";
import { SnowflakeService } from "src/common";
import { FXService } from "src/modules/fx/services";
import { GetWalletService } from "./get-wallet.service";

@Injectable()
export class TradeCurrencyService {
    private readonly logger = new Logger(TradeCurrencyService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly snowflakeService: SnowflakeService,
        private readonly fxService: FXService,
        private readonly getWalletService: GetWalletService,
    ) { }

    async execute(userId: bigint, dto: TradeDto) {
        const { fromCurrency, toCurrency } = this.resolveCurrencies(dto);

        const { fromWallet, toWallet } = await this.getWalletService.getCustomerWallets(
            userId,
            fromCurrency,
            toCurrency,
        );

        if (fromWallet.balance < dto.amount) {
            throw new UnprocessableEntityException(`Insufficient balance in ${fromCurrency} wallet`);
        }

        const { conversion_rate: rate } = await this.fxService.getPairConversions(fromCurrency, toCurrency);
        const toAmount = rate * dto.amount;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const lockedFromWallet = await this.lockWallet(queryRunner, fromWallet.id);
            const lockedToWallet = await this.lockWallet(queryRunner, toWallet.id);

            if (Number(lockedFromWallet.balance) < dto.amount) {
                throw new UnprocessableEntityException(`Insufficient balance in ${fromCurrency} wallet`);
            }

            await this.debitWallet(queryRunner, lockedFromWallet, dto.amount);
            await this.creditWallet(queryRunner, lockedToWallet, toAmount);

            await this.createTransaction(queryRunner, {
                userId: BigInt(userId),
                walletId: lockedFromWallet.id,
                type: ETransactionType.DEBIT,
                amount: dto.amount,
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
            this.logger.log(`Trade executed for user ${userId}: ${dto.amount} ${fromCurrency} -> ${toAmount} ${toCurrency} at rate ${rate}`);

            return {
                message: 'Trade executed successfully',
                from: { currency: fromCurrency, debited: dto.amount },
                to: { currency: toCurrency, credited: toAmount },
                rate,
            };

        } catch (err) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Trade failed for user ${userId}`, err);
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    private resolveCurrencies(dto: TradeDto): { fromCurrency: ECurrencyType; toCurrency: ECurrencyType } {
        const parts = dto.pair.split('/');

        if (parts.length !== 2) {
            throw new BadRequestException('Invalid pair format. Expected format: NGN/USD');
        }

        const [base, quote] = parts as [ECurrencyType, ECurrencyType];

        if (!Object.values(ECurrencyType).includes(base) || !Object.values(ECurrencyType).includes(quote)) {
            throw new BadRequestException(`Unsupported currency in pair: ${dto.pair}`);
        }

        return dto.side === 'BUY'
            ? { fromCurrency: base, toCurrency: quote }
            : { fromCurrency: quote, toCurrency: base };
    }

    private async lockWallet(queryRunner: QueryRunner, walletId: bigint): Promise<Wallet> {
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
            purpose: ETransactionPurpose.TRADE,
            amount: data.amount,
            rateUsed: data.rate,
            status: ETransactionStatus.SUCCESS,
            reference: this.snowflakeService.generateId().toString(),
        });
    }
}