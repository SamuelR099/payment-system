import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReportPdfQuery } from './get-report-pdf.query';
import { ReportRepository } from '../../infrastructure/repositories/report.repository';
import { GridFsService } from 'src/file-management/infrastructure/gridfs.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetReportPdfQuery)
export class GetReportPdfHandler implements IQueryHandler<GetReportPdfQuery> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly gridFsService: GridFsService,
  ) {}

  async execute(query: GetReportPdfQuery) {
    const report = await this.reportRepository.findById(query.reportId, true);

    if (!report?.pdfPath) {
      throw new NotFoundException(
        'Este reporte no tiene un PDF generado todavía.',
      );
    }

    const signedUrl = await this.gridFsService.getSignedUrl(
      report.pdfPath,
      3600,
    );

    return { url: signedUrl };
  }
}
