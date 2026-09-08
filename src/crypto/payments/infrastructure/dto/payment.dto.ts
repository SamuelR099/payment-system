import { IsOptional, IsString } from 'class-validator';
import { IsObjectId } from 'src/shared/validation';

export class GetPaymentsDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  excludeStatus?: string;

  @IsOptional()
  @IsObjectId()
  cursor?: string;
}

export class GetPaymentByIdDto {
  @IsString()
  paymentId: string;
}
