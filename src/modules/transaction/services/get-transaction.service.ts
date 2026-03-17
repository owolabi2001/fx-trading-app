import { Injectable } from "@nestjs/common";
import { getPagination, IPagination, IPaginationResponse } from "src/common";
import { Transaction, TransactionAdapter } from "src/database";
import { GetTransactionsDto } from "../dtos";

@Injectable()
export class GetTransactionsService {
    constructor(
        private readonly transactionAdapter: TransactionAdapter,
    ) { }

    async query(data: GetTransactionsDto, userId: bigint): Promise<IPaginationResponse<Transaction>> {
        const { limit, page, skip, take } = getPagination(data.page, data.limit);

        const [results, total] = await this.transactionAdapter
            .findPaginatedByCondition(
                {
                    wallet: {
                        userId,
                        ...(data.currency && { currency: data.currency }),
                    },
                },
                take,
                skip
            );

        return { results, total, page, limit };
    }
}