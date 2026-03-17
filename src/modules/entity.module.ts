import { Module } from "@nestjs/common";
import { UserModule } from "./user";
import { APP_GUARD } from "@nestjs/core";
import { UserAuthGuard } from "./user/guard";

@Module({
    imports: [UserModule],
    providers: [
        {
            provide: APP_GUARD,
            useClass: UserAuthGuard,
        },
    ]
})
export class EntityModule { }