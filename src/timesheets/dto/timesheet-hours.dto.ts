import { IsNumber, Min } from 'class-validator';

export class TimesheetHoursDto {
  @IsNumber()
  @Min(0)
  hours: number;
}
