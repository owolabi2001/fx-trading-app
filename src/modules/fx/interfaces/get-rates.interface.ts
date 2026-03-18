import { ECurrencyType } from "src/database";

export interface IConversionRates {
    [currencyCode: string]: number;
}

export interface IExchangeRateResponse {
    result: string;
    documentation: string;
    terms_of_use: string;
    time_last_update_unix: number;
    time_last_update_utc: string;
    time_next_update_unix: number;
    time_next_update_utc: string;
    base_code: ECurrencyType;
    conversion_rates: IConversionRates;
}