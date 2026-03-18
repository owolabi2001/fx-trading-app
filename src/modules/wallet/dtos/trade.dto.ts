import { IsEnum, IsNumber, IsPositive, IsString } from "class-validator";
import { ECurrencyType } from "src/database";

export class TradeDto {
    @IsString()
    pair: string;

    @IsEnum(['BUY', 'SELL'])
    side: 'BUY' | 'SELL';

    @IsNumber()
    @IsPositive()
    amount: number;

    @IsEnum(ECurrencyType)
    currency: ECurrencyType;
}