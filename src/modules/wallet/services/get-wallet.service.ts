import { Injectable, Logger } from "@nestjs/common";
import { SnowflakeService } from "src/common";
import { ECurrencyType, WalletAdapter } from "src/database";

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


    async createNewWallet(userId: bigint, currency: ECurrencyType) {
        const wallet = await this.walletAdapter.create({
            id: this.snowflakeService.generateId(),
            userId,
            currency,
        });

        return wallet;
    }

}