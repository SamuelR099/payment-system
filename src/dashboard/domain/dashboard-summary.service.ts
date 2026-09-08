import { Injectable } from '@nestjs/common';

import { PaymentRepository } from 'src/crypto/payments/infrastructure/repositories/payment.repository';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import { ReportStatus } from 'src/reports/domain/enums/report-status.enum';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';
import {
  getPreviousMonth,
  getWeekRange,
} from 'src/shared/utils/date.helpers';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';

@Injectable()
export class DashboardSummaryService {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly reportRepository: ReportRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getEmployeeSummary(params: {
    userId: string;
    month?: number;
    year?: number;
  }) {
    const period = this.resolvePeriod(params.month, params.year);
    const previousPeriod = getPreviousMonth(period.month, period.year);
    const reportParams = { userId: params.userId };

    const [
      user,
      monthlyHours,
      previousMonthHours,
      weeklyHours,
      pendingReportsCount,
      latestReports,
      completedPayments,
      paymentHistory,
    ] = await Promise.all([
      this.userRepository.findById(params.userId, true),
      this.timesheetRepository.getTotalHoursByMonth({
        userId: params.userId,
        month: period.month,
        year: period.year,
      }),
      this.timesheetRepository.getTotalHoursByMonth({
        userId: params.userId,
        month: previousPeriod.month,
        year: previousPeriod.year,
      }),
      this.getWeeklyHours(params.userId),
      this.reportRepository.count({
        ...reportParams,
        status: ReportStatus.SIGNED_BY_EMPLOYEE,
      }),
      this.reportRepository.findLatest(reportParams, 3),
      this.paymentRepository.findLatestByUserIdWithFilters({
        userId: params.userId,
        status: PaymentStatus.COMPLETED,
        limit: 1,
      }),
      this.paymentRepository.findLatestByUserIdWithFilters({
        userId: params.userId,
        excludeStatus: PaymentStatus.EXPIRED,
        limit: 3,
      }),
    ]);

    const hourlyRate = user.profile?.hourlyRate ?? 0;

    return {
      month: period.month,
      year: period.year,
      monthlyHours,
      previousMonthHours,
      monthlyHoursDeltaPercent: this.calculateDeltaPercent(
        monthlyHours,
        previousMonthHours,
      ),
      estimatedEarnings: this.roundAmount(monthlyHours * hourlyRate),
      hourlyRate,
      pendingReportsCount,
      lastPayment: completedPayments[0]
        ? this.mapPayment(completedPayments[0])
        : null,
      weeklyHours,
      latestReports: latestReports.map(this.mapReport),
      paymentHistory: paymentHistory.map(this.mapPayment),
    };
  }

  private resolvePeriod(month?: number, year?: number) {
    const today = new Date();
    return {
      month: month ?? today.getMonth() + 1,
      year: year ?? today.getFullYear(),
    };
  }

  private async getWeeklyHours(userId: string) {
    const { startDate, endDate } = getWeekRange();
    const rows = await this.timesheetRepository.getHoursByDateRange({
      userId,
      startDate,
      endDate,
    });
    const hoursByDate = new Map(rows.map(row => [row.date, row.hours]));

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const key = this.formatDateKey(date);

      return {
        date: key,
        dayLabel: this.getDayLabel(date),
        hours: hoursByDate.get(key) ?? 0,
      };
    });
  }

  private calculateDeltaPercent(current: number, previous: number) {
    if (previous <= 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(((current - previous) / previous) * 10000) / 100;
  }

  private roundAmount(value: number) {
    return Math.round(value * 100) / 100;
  }

  private formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDayLabel(date: Date) {
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  }

  private mapReport(report: any) {
    return {
      id: report.id ?? String(report._id),
      userId: String(report.userId),
      month: report.month,
      year: report.year,
      totalHours: report.totalHours,
      totalAmount: report.totalAmount,
      status: report.status,
      paymentId: report.paymentId ?? null,
    };
  }

  private mapPayment(payment: any) {
    return {
      id: payment.id ?? String(payment._id),
      userId: String(payment.userId),
      reportId: String(payment.reportId),
      amountExpected: payment.amountExpected,
      amountReceived: payment.amountReceived,
      status: payment.status,
      txid: payment.txid,
      network: payment.network,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    };
  }
}
