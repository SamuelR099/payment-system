import { IsOptional, IsString } from 'class-validator';
import { IsObjectId } from 'src/shared/validation';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetTimesheetsDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @IsOptional()
  @IsObjectId()
  cursor?: string;

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
