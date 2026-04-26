
import { IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MonthlySummaryProjectDto {
  @IsString()
  project: string;

  @IsNumber()
  hours: number;
}

export class TimesheetDto {
  @IsString()
  id: string;

  @IsString()
  userId: string;

  @Type(() => Date)
  date: Date;

  @IsString()
  project: string;

  @IsString()
  description: string;

  @IsNumber()
  hours: number;

  @IsNumber()
  hourlyRate: number;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;
}

export class MonthlySummaryResponseDto {
  @IsNumber()
  month: number;

  @IsNumber()
  year: number;

  @IsNumber()
  totalHours: number;

  @IsNumber()
  totalFacturado: number;

  @IsNumber()
  totalEntries: number;

  @IsNumber()
  avgHoursPerDay: number;

  @IsNumber()
  uniqueProjects: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MonthlySummaryProjectDto)
  projectSummary: MonthlySummaryProjectDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimesheetDto)
  timesheets: TimesheetDto[];
}
