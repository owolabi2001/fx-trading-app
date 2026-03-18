import { HttpException, Injectable, Logger } from "@nestjs/common";
import { IPairConversionResponse } from "../interfaces";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { map } from "rxjs/operators";
import { EEnvironmentConstants } from "src/common";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class ExchangeApiService {
    private readonly logger = new Logger(ExchangeApiService.name);

    private fXApiKey: string | undefined;
    constructor(
        private readonly httpService: HttpService,
        configService: ConfigService,
    ) {
        this.fXApiKey = configService.get<string>(EEnvironmentConstants.exchangeRateApiKey);
    }


    async getPairConversions(baseCurrency: string, targetCurrency: string): Promise<IPairConversionResponse> {
        const url = `https://v6.exchangerate-api.com/v6/${this.fXApiKey}/pair/${baseCurrency}/${targetCurrency}`;

        try {
            const response = await firstValueFrom(
                this.httpService.get<IPairConversionResponse>(url).pipe(map(res => res.data))
            );
            return response;
        } catch (error) {
            const errorData = error.response?.data;
            const errorType = errorData?.['error-type'] || 'unknown-error';
            const status = error.response?.status || 500;

            this.logger.error(`Failed to retrieve pair conversion: ${errorType}`, error.stack);
            throw new HttpException({
                status,
                error: errorType,
                message: `ExchangeRate API error: ${errorType}`
            }, status);
        }
    }


    async getFXRates(baseCurrency: string): Promise<any> {
        const url = `https://v6.exchangerate-api.com/v6/${this.fXApiKey}/latest/${baseCurrency}`;
        try {
            const response = await firstValueFrom(
                this.httpService.get<IPairConversionResponse>(url).pipe(map(res => res.data))
            );
            return response;
        } catch (error) {
            const errorData = error.response?.data;
            const errorType = errorData?.['error-type'] || 'unknown-error';
            const status = error.response?.status || 500;

            this.logger.error(`Failed to retrieve FX rates: ${errorType}`, error.stack);
            throw new HttpException({
                status,
                error: errorType,
                message: `ExchangeRate API error: ${errorType}`
            }, status);
        }
    }

}
