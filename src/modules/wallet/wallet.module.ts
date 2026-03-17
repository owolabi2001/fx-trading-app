import { Module } from "@nestjs/common";
import { UserModule } from "../user";
import { GetWalletService } from "./services";
import { WalletController } from "./wallet.controller";

@Module({
    controllers: [WalletController],
    providers: [GetWalletService],
    imports: [UserModule]
})
export class WalletModule { }