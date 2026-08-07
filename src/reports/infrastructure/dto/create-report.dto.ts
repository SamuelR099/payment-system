import { IsNumber } from 'class-validator';
import { IsObjectId } from 'src/shared/validation';

export class CreateReportDto {
  @IsObjectId()
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
