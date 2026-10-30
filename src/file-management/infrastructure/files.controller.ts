import {
  Controller,
  Get,
  Param,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Public } from 'src/shared/validation';
import { GetFileQuery } from '../application/get-file/get-file.query';

@Controller('files')
export class FilesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/:id')
  @Public()
  async getFile(
    @Param('id') id: string,
    @Query('token') token: string,
  ) {
    const file = await this.queryBus.execute(new GetFileQuery(id, token));

    return new StreamableFile(file.stream, {
      type: file.contentType,
      disposition: `inline; filename="${file.fileName}"`,
    });
  }
}
