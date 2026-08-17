import { Injectable } from '@nestjs/common';
import { DomainError } from 'src/shared/domain';
import { OldReportRepository } from '../infrastructure/repositories/old-report.repository';

@Injectable()
export class OldReportDomainService {
  constructor(private readonly oldReportRepository: OldReportRepository) {}

  async validateNoDuplicatePeriod(params: {
    referenceMonth: number;
    referenceYear: number;
  }) {
    const exists = await this.oldReportRepository.findByPeriod(
      params.referenceMonth,
      params.referenceYear,
    );
    if (exists) {
      throw new DomainError(
        'DUPLICATE_OLD_REPORT',
        'Ya existe un reporte antiguo para este periodo.',
      );
    }
  }
}
