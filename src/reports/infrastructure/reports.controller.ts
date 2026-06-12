import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';

import { FileUploadValidationPipe } from 'src/file-management/infrastructure/file-upload-validation-pipe';
import { ALLOWED_MIME_TYPES } from 'src/shared/enums/file-types.enum';
import { FILE_SIZES } from 'src/shared/enums/file-size';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';

import { SearchReportQuery } from '../application/search-report/search-report.query';
import { GetReportQuery } from '../application/get-report/get-report.query';
import { GetReportPdfQuery } from '../application/get-report-pdf/get-report-pdf.query';
import { SubmitReportCommand } from '../application/submit-report/submit-report.command';
import { ApproveReportAdminCommand } from '../application/approve-report-admin/approve-report-admin.command';
import { RejectReportAdminCommand } from '../application/reject-report-admin/reject-report-admin.command';

import { GetReportsDto } from './dto/get-reports.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get('/')
  async getReports(@Query() query: GetReportsDto, @Request() req: any) {
    return this.queryBus.execute(new SearchReportQuery({
      ...query,
      userId: req.user.userId,
      userRole: req.user.role,
    }));
  }

  @Get('/:id')
  async getReport(@Param('id') id: string) {
    return this.queryBus.execute(new GetReportQuery(id));
  }

  @Get('/:id/pdf')
  async getReportPdf(@Param('id') id: string) {
    return this.queryBus.execute(new GetReportPdfQuery(id));
  }

  @Post('/submit')
  @Roles([UserRole.ADMIN])
  async submitReport(@Body() body: { reportId: string; userId: string }) {
    return this.commandBus.execute(
      new SubmitReportCommand(body.reportId, body.userId),
    );
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
      }),
    )
    file?: Multer.File,
  ) {
    const adminId = req.user?.userId || body.adminId;
    return this.commandBus.execute(
      new ApproveReportAdminCommand({ reportId: id, adminId, file }),
    );
  }

  @Post('/:id/reject')
  @Roles([UserRole.ADMIN])
  async rejectReport(
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(
      new RejectReportAdminCommand(id),
    );
  }
}