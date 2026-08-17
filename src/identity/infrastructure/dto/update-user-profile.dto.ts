import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EmployeePosition } from 'src/shared/enums';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(EmployeePosition)
  @IsOptional()
  position?: EmployeePosition;

  @IsNumber()
  @IsOptional()
  @Min(1)
  hourlyRate?: number;

  @IsString()
  @IsOptional()
  signatureImageUrl?: string;
}
