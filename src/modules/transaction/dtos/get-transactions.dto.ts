import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common";
import { ECurrencyType } from "src/database";

export class GetTransactionsDto extends PaginationDto {
    @IsEnum(ECurrencyType)
    @IsOptional()
    currency?: ECurrencyType;
}