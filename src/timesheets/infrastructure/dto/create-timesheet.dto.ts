import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  IsDate,
  MaxDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTimesheetDto {
  @IsNotEmpty()
  @Type(() => Date)
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
  @IsNotEmpty()
  @Min(0.25)
  @Max(24)
  hours: number;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsNotEmpty()
  @Min(0)
  hourlyRate: number;
}
