import { IsEnum, IsOptional } from "class-validator";
import { ECurrencyType } from "src/database";

export class GetWalletDto {
    @IsEnum(ECurrencyType)
    @IsOptional()
    currency?: ECurrencyType;
}