import { Module } from "@nestjs/common";
import { UserModule } from "./user";
import { APP_GUARD } from "@nestjs/core";
import { UserAuthGuard } from "./user/guard";
import { WalletModule } from "./wallet";

@Module({
    imports: [UserModule, WalletModule],
    providers: [
        {
            provide: APP_GUARD,
            useClass: UserAuthGuard,
        },
    ]
})
export class EntityModule { }