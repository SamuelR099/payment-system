import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetMonthlySummaryDto {
  @Type(() => Number)
  @IsInt()
  month: number;

  @Type(() => Number)
  @IsInt()
  year: number;
}
