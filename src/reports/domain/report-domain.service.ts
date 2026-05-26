import { Injectable } from '@nestjs/common';
import { ReportStatus } from './enums/report-status.enum';
import { DomainError } from 'src/shared/domain';
import { ReportPeriod } from './value-objects/report-period';

export interface Timesheet {
  userId: string;
  hours: number;
  hourlyRate: number;
  month: number;
  year: number;
  signatureImageUrl?: string;
}

export interface GeneratedReport {
  userId: string;
  month: number;
  year: number;
  totalHours: number;
  totalAmount: number;
  status: string;
  employeeSigned?: boolean;
  employeeSignatureImage?: string;
  employeeSignedAt?: Date;
}

@Injectable()
export class ReportDomainService {
  generateMonthlyReport(
    timesheets: Timesheet[],
    period: ReportPeriod,
  ): GeneratedReport {
    if (!timesheets || timesheets.length === 0) {
      throw new DomainError(
        'NO_TIMESHEETS_FOUND',
        `No hay hojas de tiempo para el periodo ${period.getLabel()}.`,
      );
    }

    const userId = timesheets[0].userId;
    const totalHours = timesheets.reduce(
      (sum, timesheet) => sum + (timesheet.hours ?? 0),
      0,
    );
    const totalAmount = timesheets.reduce(
      (sum, timesheet) =>
        sum + (timesheet.hours ?? 0) * (timesheet.hourlyRate ?? 0),
      0,
    );

    const signature = timesheets.find(t => t.signatureImageUrl)?.signatureImageUrl;

    return {
      userId,
      month: period.month,
      year: period.year,
      totalHours,
      totalAmount,
      status: ReportStatus.SIGNED_BY_EMPLOYEE,
      employeeSigned: !!signature,
      employeeSignatureImage: signature,
      employeeSignedAt: signature ? new Date() : undefined,
    };
  }
}
