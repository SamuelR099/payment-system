import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReportDto {
  @IsOptional()
  @IsNumber()
  totalHours?: number;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsString()
  pdfPath?: string;
}
