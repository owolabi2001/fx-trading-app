import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FXUser, IFXUser } from "src/common";
import { FundWalletService, GetWalletService } from "./services";
import { FundWalletDto, GetWalletDto } from "./dtos";

@Controller('wallet')
@ApiTags('wallet')
@ApiBearerAuth()
export class WalletController {
    constructor(
        private readonly getWalletService: GetWalletService,
        private readonly fundWalletService: FundWalletService,
    ) { }

    @Get()
    getWallet(@FXUser() { id }: IFXUser, @Query() { currency }: GetWalletDto) {
        return this.getWalletService.query(id, currency);
    }

    @Post('fund')
    fundWallet(@Body() data: FundWalletDto, @FXUser() { id }: IFXUser) {
        return this.fundWalletService.execute(id, data);
    }
}