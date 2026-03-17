import { IsEnum, IsNumber, IsPositive } from "class-validator";
import { ECurrencyType } from "src/database";

export class FundWalletDto {
    @IsNumber()
    @IsPositive()
    amount: number;

    @IsEnum(ECurrencyType)
    currency: ECurrencyType;
}