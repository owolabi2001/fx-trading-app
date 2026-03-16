import { IsNumberString, IsOptional } from 'class-validator';

export class PaginationDto {
  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsNumberString()
  @IsOptional()
  limit?: number;
}
