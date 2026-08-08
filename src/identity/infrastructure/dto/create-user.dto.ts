import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { UserRole, EmployeePosition } from 'src/shared/enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  wallet?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hourlyRate?: number;

  @IsEnum(EmployeePosition)
  @IsOptional()
  position?: EmployeePosition;

  @IsString()
  @IsOptional()
  slackUserId?: string;
}
