import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { ReportStatus } from '../../domain/enums/report-status.enum';

export class GetReportsDto {
  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
