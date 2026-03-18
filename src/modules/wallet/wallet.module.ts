import { Module } from "@nestjs/common";
import { UserModule } from "../user";
import { FundWalletService, GetWalletService } from "./services";
import { WalletController } from "./wallet.controller";
import { FxModule } from "../fx";

@Module({
    controllers: [WalletController],
    providers: [GetWalletService, FundWalletService],
    imports: [UserModule, FxModule]
})
export class WalletModule { }