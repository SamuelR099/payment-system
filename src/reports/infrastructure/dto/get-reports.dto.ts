import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { IsObjectId } from 'src/shared/validation';
import { ReportStatus } from '../../domain/enums/report-status.enum';

export class GetReportsDto {
  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsObjectId()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
