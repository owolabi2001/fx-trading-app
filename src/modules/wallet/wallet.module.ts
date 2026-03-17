import { Module } from "@nestjs/common";
import { UserModule } from "../user";
import { FundWalletService, GetWalletService } from "./services";
import { WalletController } from "./wallet.controller";

@Module({
    controllers: [WalletController],
    providers: [GetWalletService, FundWalletService],
    imports: [UserModule]
})
export class WalletModule { }