import { IsOptional } from "class-validator";

export class GetRatesDto {
    @IsOptional()
    baseCurrency: string;
}