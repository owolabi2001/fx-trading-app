import { Injectable } from "@nestjs/common";
import { ConvertCurrencyDto } from "../dtos";

@Injectable()
export class ConvertCurrencyService {
    constructor() { }

    async execute(userId: string, data: ConvertCurrencyDto) {
        const { fromCurrency, toCurrency, amount } = data;
    }
}