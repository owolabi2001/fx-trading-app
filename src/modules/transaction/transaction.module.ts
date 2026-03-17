import { Module } from "@nestjs/common";
import { TransactionController } from "./transaction.controller";
import { GetTransactionsService } from "./services";

@Module({
    providers: [GetTransactionsService],
    controllers: [TransactionController]
})
export class TransactionModule { }