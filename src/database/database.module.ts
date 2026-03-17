import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Profile, Token, Transaction, User, Wallet } from "./entities";
import { ProfileAdapter, TokenAdapter, TransactionAdapter, UserAdapter, WalletAdapter } from "./adapters";

const entities = [
    User,
    Profile,
    Transaction,
    Wallet,
    Token
];
const adapters = [
    UserAdapter,
    ProfileAdapter,
    TransactionAdapter,
    WalletAdapter,
    TokenAdapter
];

@Global()
@Module({
    imports: [TypeOrmModule.forFeature(entities)],
    providers: adapters,
    exports: adapters,
})
export class DatabaseModule { }