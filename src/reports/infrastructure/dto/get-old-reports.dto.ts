import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { IsObjectId } from 'src/shared/validation';

export class GetOldReportsDto {
  @IsOptional()
  @IsObjectId()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}
