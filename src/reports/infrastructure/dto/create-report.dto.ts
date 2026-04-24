import { IsString, IsNumber } from 'class-validator';

export class CreateReportDto {
  @IsString()
  userId: string;

  @IsNumber()
  month: number;

  @IsNumber()
  year: number;

  @IsNumber()
  totalHours: number;

  @IsNumber()
  totalAmount: number;
}
