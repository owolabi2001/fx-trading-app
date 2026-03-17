import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FXUser, getPagination, IFXUser, PaginationDto } from "src/common";
import { GetTransactionsService } from "./services";
import { GetTransactionsDto } from "./dtos";

@ApiTags('transaction')
@Controller('transaction')
@ApiBearerAuth()
export class TransactionController {
    constructor(
        private readonly getTransactionsService: GetTransactionsService,
    ) { }

    @Get()
    getTransactions(@Query() data: GetTransactionsDto, @FXUser() { id }: IFXUser) {
        return this.getTransactionsService.query(data, id);
    }
}