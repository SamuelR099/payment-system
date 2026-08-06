import { IsOptional, IsEnum } from 'class-validator';
import { UserRole } from 'src/shared/enums/user-role.enum';

export class GetUsersDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
