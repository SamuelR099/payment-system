import { Controller, Get, Post, Body, Param, Put, Query, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { FileUploadValidationPipe } from '../../file-management/infrastructure/file-upload-validation-pipe';
import { ALLOWED_MIME_TYPES } from 'src/shared/enums/file-types.enum';
import { FILE_SIZES } from 'src/shared/enums/file-size';

import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';

import { SearchReportQuery } from '../application/search-report/search-report.query';
import { GetReportQuery } from '../application/get-report/get-report.query';
import { SubmitReportCommand } from '../application/submit-report/submit-report.command';
import { ApproveReportByAdminCommand } from '../application/approve-report-admin/approve-report-admin.command';
import { UpdateReportCommand } from '../application/update-report/update-report.command';

import { GetReportsDto } from './dto/get-reports.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/')
  async getReports(@Query() query: GetReportsDto) {
    return this.queryBus.execute(new SearchReportQuery(query));
  }

  @Get('/:id')
  async getReport(@Param('id') id: string) {
    return this.queryBus.execute(new GetReportQuery(id));
  }

  @Post('/submit')
  @Roles([UserRole.ADMIN])
  async submitReport(@Body() body: { reportId: string; userId: string }) {
    return this.commandBus.execute(new SubmitReportCommand(body.reportId, body.userId));
  }


  @Post('/:id/approve')
  @Roles([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor('file'))
  async approveReport(
    @Param('id') id: string,
    @Body() body: { adminId?: string },
    @Request() req: any,
    @UploadedFile(
      new FileUploadValidationPipe({
        allowedTypes: ALLOWED_MIME_TYPES,
        maxSizeInBytes: FILE_SIZES.ONE_HUNDRED_MB,
        isOptional: true,
      })
    )
    file?: Multer.File,
  ) {
    const adminId = req.user?.userId || body.adminId;
    return this.commandBus.execute(new ApproveReportByAdminCommand({ reportId: id, adminId, file }));
  }

  @Put('/:id')
  @Roles([UserRole.ADMIN])
  async updateReport(
    @Param('id') id: string,
    @Body() body: UpdateReportDto,
  ) {
    // El comando ahora acepta un objeto, y el constructor hace Object.assign
    return this.commandBus.execute(new UpdateReportCommand({ reportId: id, ...body }));
  }
}
