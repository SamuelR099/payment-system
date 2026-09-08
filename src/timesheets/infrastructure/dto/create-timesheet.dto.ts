import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { parseLocalDate } from 'src/shared/utils';

export class CreateTimesheetDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseLocalDate(value))
  @IsDate()
  date: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  project: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @Min(1)
  @Max(24)
  hours: number;
}
