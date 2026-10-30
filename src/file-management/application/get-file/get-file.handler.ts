import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GridFsService } from '../../infrastructure/gridfs.service';
import { GetFileQuery } from './get-file.query';

@QueryHandler(GetFileQuery)
export class GetFileHandler implements IQueryHandler<GetFileQuery> {
  constructor(private readonly gridFsService: GridFsService) {}

  execute(query: GetFileQuery) {
    return this.gridFsService.getFile(
      `gridfs:${query.fileId}`,
      query.accessToken,
    );
  }
}
