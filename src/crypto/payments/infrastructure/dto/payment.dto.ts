import { IsOptional, IsString } from 'class-validator';

export class GetPaymentsDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  cursor?: string;
}

export class GetPaymentByIdDto {
  @IsString()
  paymentId: string;
}
