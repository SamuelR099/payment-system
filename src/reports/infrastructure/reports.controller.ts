import {
  Controller,
  Get,
  Post,
  Delete,
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

import { GetReportsQuery } from '../application/get-reports/get-reports.query';
import { GetReportPdfQuery } from '../application/get-report-pdf/get-report-pdf.query';
import { SubmitReportCommand } from '../application/submit-report/submit-report.command';
import { ApproveReportAdminCommand } from '../application/approve-report-admin/approve-report-admin.command';
import { RejectReportAdminCommand } from '../application/reject-report-admin/reject-report-admin.command';
import { UploadOldReportCommand } from '../application/upload-old-report/upload-old-report.command';
import { DeleteOldReportCommand } from '../application/delete-old-report/delete-old-report.command';
import { GetOldReportsQuery } from '../application/get-old-reports/get-old-reports.query';
import { GetOldReportPdfQuery } from '../application/get-old-report-pdf/get-old-report-pdf.query';

import { GetReportsDto } from './dto/get-reports.dto';
import { GetOldReportsDto } from './dto/get-old-reports.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/')
  async getReports(@Query() query: GetReportsDto, @Request() req: any) {
    return this.queryBus.execute(
      new GetReportsQuery({
        ...query,
        userId: req.user.userId,
        userRole: req.user.role,
      }),
    );
  }

  @Get('/old-pdf')
  async getOldReports(@Request() req: any, @Query() query: GetOldReportsDto) {
    return this.queryBus.execute(
      new GetOldReportsQuery({
        userId: req.user.userId,
        role: req.user.role,
        cursor: query.cursor,
        limit: query.limit,
      }),
    );
  }

  @Get('/old-pdf/:id/pdf')
  async getOldReportPdf(@Param('id') id: string, @Request() req: any) {
    return this.queryBus.execute(
      new GetOldReportPdfQuery(id, req.user.userId, req.user.role),
    );
  }

  @Post('/old-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOldReport(
    @UploadedFile(
      new FileUploadValidationPipe({
        allowedTypes: /pdf/,
        maxSizeInBytes: FILE_SIZES.ONE_HUNDRED_MB,
      }),
    )
    file: Multer.File,
    @Body()
    body: {
      pdfFileName: string;
      referenceMonth: string;
      referenceYear: string;
    },
    @Request() req: any,
  ) {
    return this.commandBus.execute(
      new UploadOldReportCommand({
        ...body,
        referenceMonth: Number(body.referenceMonth),
        referenceYear: Number(body.referenceYear),
        file,
        uploadedBy: req.user.userId,
      }),
    );
  }

  @Delete('/old-pdf/:id')
  @Roles([UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.EMPLOYEE])
  async deleteOldReport(@Param('id') id: string, @Request() req: any) {
    return this.commandBus.execute(
      new DeleteOldReportCommand(id, req.user.userId, req.user.role),
    );
  }

  @Get('/:id/pdf')
  async getReportPdf(@Param('id') id: string) {
    return this.queryBus.execute(new GetReportPdfQuery(id));
  }

  @Post('/submit')
  @Roles([UserRole.SUPERVISOR])
  async submitReport(@Body() body: { reportId: string; userId: string }) {
    return this.commandBus.execute(
      new SubmitReportCommand(body.reportId, body.userId),
    );
  }

  @Post('/:id/approve')
  @Roles([UserRole.SUPERVISOR])
  @UseInterceptors(FileInterceptor('file'))
  async approveReport(
    @Param('id') id: string,
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
    const adminId = req.user.userId;
    return this.commandBus.execute(
      new ApproveReportAdminCommand({ reportId: id, adminId, file }),
    );
  }

  @Post('/:id/reject')
  @Roles([UserRole.SUPERVISOR])
  async rejectReport(@Param('id') id: string, @Request() req: any) {
    return this.commandBus.execute(
      new RejectReportAdminCommand(id, req.user.userId),
    );
  }
}
