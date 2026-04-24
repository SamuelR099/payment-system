import { IsOptional, IsString, Matches } from 'class-validator';

export class GetTimesheetCountsDto {
  @IsOptional()
  @IsString()
  @Matches(/^(0?[1-9]|1[0-2])$/, {
    message: 'Month must be a number between 1 and 12',
  })
  month?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'Year must be a 4-digit number',
  })
  year?: string;
}
