import { IsOptional, IsEnum } from 'class-validator';
import { IsObjectId } from 'src/shared/validation';
import { ReportStatus } from '../../domain/enums/report-status.enum';

export class GetReportsDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsObjectId()
  cursor?: string;
}
