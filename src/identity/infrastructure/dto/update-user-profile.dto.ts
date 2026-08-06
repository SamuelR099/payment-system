import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
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
}
