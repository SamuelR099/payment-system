import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GridFsService } from 'src/file-management/infrastructure/gridfs.service';
import { OldReportRepository } from '../../infrastructure/repositories/old-report.repository';
import { GetOldReportPdfQuery } from './get-old-report-pdf.query';

@QueryHandler(GetOldReportPdfQuery)
export class GetOldReportPdfHandler
  implements IQueryHandler<GetOldReportPdfQuery>
{
  constructor(
    private readonly oldReportRepository: OldReportRepository,
    private readonly gridFsService: GridFsService,
  ) {}

  async execute(query: GetOldReportPdfQuery) {
    const { reportId } = query;
    const report = await this.oldReportRepository.findById(reportId, true);

    const signedUrl = await this.gridFsService.getSignedUrl(report.pdfPath);

    return { url: signedUrl };
  }
}
