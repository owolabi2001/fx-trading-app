import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FXUser, IFXUser } from "src/common";
import { GetWalletService } from "./services";
import { GetWalletDto } from "./dtos";

@Controller('wallet')
@ApiTags('wallet')
@ApiBearerAuth()
export class WalletController {
    constructor(
        private readonly getWalletService: GetWalletService,
    ) { }

    @Get()
    getWallet(@FXUser() { id }: IFXUser, @Query() { currency }: GetWalletDto) {
        return this.getWalletService.query(id, currency);
    }
}