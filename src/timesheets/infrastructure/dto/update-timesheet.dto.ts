import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { parseLocalDate } from 'src/shared/utils';

export class UpdateTimesheetDto {
  @IsOptional()
  @Transform(({ value }) => parseLocalDate(value))
  @IsDate()
  date?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  project?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(24)
  hours?: number;
}
