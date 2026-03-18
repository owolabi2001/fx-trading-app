import { Module } from "@nestjs/common";
import { UserModule } from "../user";
import { ConvertCurrencyService, FundWalletService, GetWalletService } from "./services";
import { WalletController } from "./wallet.controller";
import { FxModule } from "../fx";

@Module({
    controllers: [WalletController],
    providers: [GetWalletService, FundWalletService, ConvertCurrencyService],
    imports: [UserModule, FxModule]
})
export class WalletModule { }