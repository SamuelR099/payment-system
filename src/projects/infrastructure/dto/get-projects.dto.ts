import { IsOptional } from 'class-validator';

import { IsObjectId } from 'src/shared/validation';

export class GetProjectsDto {
  @IsOptional()
  @IsObjectId()
  cursor?: string;
}
