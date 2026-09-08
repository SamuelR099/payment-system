import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDashboardSummaryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
