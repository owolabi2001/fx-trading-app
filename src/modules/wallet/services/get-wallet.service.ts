import { Injectable, Logger } from "@nestjs/common";
import { SnowflakeService } from "src/common";
import { ECurrencyType, WalletAdapter } from "src/database";
import { In } from "typeorm";

@Injectable()
export class GetWalletService {
    private readonly logger = new Logger(GetWalletService.name);
    constructor(
        private readonly snowflakeService: SnowflakeService,
        private readonly walletAdapter: WalletAdapter,
    ) { }


    async query(userId: bigint, currency?: ECurrencyType) {
        this.logger.log(`Querying wallet for user ${userId}`);

        let wallets = await this.walletAdapter.findMany({
            userId,
            ...(currency && { currency })
        });

        if (!wallets.length && currency) {
            wallets.push(await this.createNewWallet(userId, currency));
        }

        return {
            results: wallets.map(w => ({
                ...w,
                id: w.id.toString(),
                userId: w.userId.toString(),
            })),
        };
    }


    private async createNewWallet(userId: bigint, currency: ECurrencyType) {
        const wallet = await this.walletAdapter.create({
            id: this.snowflakeService.generateId(),
            userId,
            currency,
        });

        this.logger.log(`Successfully created new wallet for user with id: ${userId} and currency: ${currency}`)
        return wallet;
    }

    async validate(userId: bigint, currency: ECurrencyType) {
        const wallet = await this.walletAdapter.findOne({ userId, currency });
        if (!wallet) {
            const wallet = await this.createNewWallet(userId, currency);
            return wallet;
        }

        this.logger.log(`Successfully fetched wallet for user with id: ${userId} and currency: ${currency}`)
        return wallet;
    }

    async getCustomerWallets(userId: bigint, fromCurrency: ECurrencyType, toCurrency: ECurrencyType) {
        const wallets = await this.walletAdapter.findMany({
            userId,
            currency: In([fromCurrency, toCurrency])
        })

        if (wallets.length !== 2) {
            const existingCurrencies = wallets.map(w => w.currency);
            const missingCurrencies = [fromCurrency, toCurrency].filter(c => !existingCurrencies.includes(c));

            const newWallets = await Promise.all(
                missingCurrencies.map(currency => this.walletAdapter.create({
                    id: this.snowflakeService.generateId(),
                    userId,
                    currency,
                }))
            );

            wallets.push(...newWallets);

        }

        return {
            fromWallet: wallets.find(w => w.currency === fromCurrency)!,
            toWallet: wallets.find(w => w.currency === toCurrency)!,
        }
    }

}