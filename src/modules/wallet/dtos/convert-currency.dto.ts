import { IsEnum, IsNumber, IsPositive } from "class-validator";
import { ECurrencyType } from "src/database";

export class ConvertCurrencyDto {
    @IsEnum(ECurrencyType)
    fromCurrency: ECurrencyType;

    @IsEnum(ECurrencyType)
    toCurrency: ECurrencyType;

    @IsNumber()
    @IsPositive()
    amount: number;
}