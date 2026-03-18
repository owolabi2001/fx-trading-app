import { Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { GetRatesDto } from "./dtos";
import { FXService } from "./services";
import { ECurrencyType } from "src/database";

@Controller('fx')
@ApiTags('fx')
@ApiBearerAuth()
export class FxController {
    constructor(
        private readonly fxService: FXService,
    ) { }


    @Get('rates')
    @ApiOperation({ summary: 'Get rates for a specific currency' })
    @ApiQuery({ name: 'baseCurrency', enum: ECurrencyType })
    getRates(@Query() { baseCurrency }: GetRatesDto) {
        return this.fxService.getFXRates(baseCurrency);
    }

    @Get('rate')
    @ApiOperation({ summary: 'Get rate for a specific currency pair' })
    @ApiQuery({ name: 'from', enum: ECurrencyType })
    @ApiQuery({ name: 'to', enum: ECurrencyType })
    getRate(
        @Query('from') from: ECurrencyType,
        @Query('to') to: ECurrencyType,
    ) {
        return this.fxService.getPairConversions(from, to);
    }


}