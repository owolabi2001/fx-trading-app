import { Module } from "@nestjs/common";
import { UserModule } from "../user";
import { ConvertCurrencyService, FundWalletService, GetWalletService, TradeCurrencyService } from "./services";
import { WalletController } from "./wallet.controller";
import { FxModule } from "../fx";

@Module({
    controllers: [WalletController],
    providers: [GetWalletService, FundWalletService, ConvertCurrencyService, TradeCurrencyService],
    imports: [UserModule, FxModule]
})
export class WalletModule { }