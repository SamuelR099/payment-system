import { IsOptional, IsString } from 'class-validator';

export class SignTimesheetDto {
  @IsOptional()
  @IsString()
  note?: string;
}
