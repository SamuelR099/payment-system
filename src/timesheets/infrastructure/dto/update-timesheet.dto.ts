import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateTimesheetDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  project?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(24)
  hours?: number;
}
