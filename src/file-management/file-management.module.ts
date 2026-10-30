import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { FilesController } from './infrastructure/files.controller';
import { GridFsService } from './infrastructure/gridfs.service';
import { GetFileHandler } from './application/get-file/get-file.handler';

@Module({
  imports: [CqrsModule],
  controllers: [FilesController],
  providers: [GridFsService, GetFileHandler],
  exports: [GridFsService],
})
export class FileManagementModule {}
