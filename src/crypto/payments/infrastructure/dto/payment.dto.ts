import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { IsObjectId } from 'src/shared/validation';

export class GetPaymentsDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsObjectId()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

export class GetPaymentByIdDto {
  @IsString()
  paymentId: string;
}
