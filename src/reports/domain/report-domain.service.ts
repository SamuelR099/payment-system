import { Injectable } from '@nestjs/common';
import { ReportStatus } from './enums/report-status.enum';

export interface Timesheet {
  userId: string;
  hours: number;
  hourlyRate: number;
  month: number;
  year: number;
}

export interface GeneratedReport {
  userId: string;
  month: number;
  year: number;
  totalHours: number;
  totalAmount: number;
  status: string;
}

@Injectable()
export class ReportDomainService {
  generateMonthlyReport(
    timesheets: Timesheet[],
    month: number,
    year: number,
  ): GeneratedReport {
    if (!timesheets || timesheets.length === 0) {
      throw new Error('No timesheets provided for report generation.');
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
    return {
      userId,
      month,
      year,
      totalHours,
      totalAmount,
      status: ReportStatus.CLOSED,
    };
  }
}
