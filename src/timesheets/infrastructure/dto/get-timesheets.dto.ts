import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetTimesheetsDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  terms?: string;
}
