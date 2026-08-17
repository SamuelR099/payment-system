import { Injectable } from '@nestjs/common';
import { ReportStatus } from './enums/report-status.enum';
import { DomainError } from 'src/shared/domain';
import { ReportPeriod } from './value-objects/report-period';

export interface Timesheet {
  userId: string;
  hours: number;
  month: number;
  year: number;
}

export interface GeneratedReport {
  userId: string;
  supervisorId?: string;
  month: number;
  year: number;
  totalHours: number;
  totalAmount: number;
  hourlyRate: number;
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
    hourlyRate: number,
    employeeSignatureImage?: string,
    supervisorId?: string,
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
    const totalAmount = totalHours * hourlyRate;

    return {
      userId,
      supervisorId,
      month: period.month,
      year: period.year,
      totalHours,
      totalAmount,
      hourlyRate,
      status: ReportStatus.SIGNED_BY_EMPLOYEE,
      employeeSigned: !!employeeSignatureImage,
      employeeSignatureImage,
      employeeSignedAt: employeeSignatureImage ? new Date() : undefined,
    };
  }
}
