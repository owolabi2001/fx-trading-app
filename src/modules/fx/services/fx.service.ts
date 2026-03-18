import { Injectable } from "@nestjs/common";
import { ExchangeApiService } from "./exchange-api.service";
import { IExchangeRateResponse, IPairConversionResponse } from "../interfaces";
import { RedisCacheService } from "src/common";

@Injectable()
export class FXService {
    constructor(
        private readonly cacheService: RedisCacheService,
        private readonly exchangeApiService: ExchangeApiService) { }

    async getPairConversions(baseCurrency: string, targetCurrency: string): Promise<IPairConversionResponse> {

        const cacheKey = `fx:rate:${baseCurrency}:${targetCurrency}`
        let rates = await this.cacheService.get(cacheKey);

        if (!rates) {
            rates = await this.exchangeApiService.getPairConversions(baseCurrency, targetCurrency);
            await this.cacheService.set(cacheKey, rates, (60 * 60));
        }

        return rates as IPairConversionResponse;
    }

    async getFXRates(baseCurrency: string): Promise<IExchangeRateResponse> {
        const cacheKey = `fx:rates:${baseCurrency}`
        let rates = await this.cacheService.get(cacheKey);

        if (!rates) {
            rates = await this.exchangeApiService.getFXRates(baseCurrency);
            await this.cacheService.set(cacheKey, rates, (60 * 60));
        }

        return rates as IExchangeRateResponse;
    }


}