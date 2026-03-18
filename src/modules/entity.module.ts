import { Module } from "@nestjs/common";
import { UserModule } from "./user";
import { APP_GUARD } from "@nestjs/core";
import { UserAuthGuard } from "./user/guard";
import { WalletModule } from "./wallet";
import { TransactionModule } from "./transaction";
import { FxModule } from "./fx";

@Module({
    imports: [UserModule, WalletModule, TransactionModule, FxModule],
    providers: [
        {
            provide: APP_GUARD,
            useClass: UserAuthGuard,
        },
    ]
})
export class EntityModule { }   