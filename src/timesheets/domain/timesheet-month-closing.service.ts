import { Injectable } from '@nestjs/common';

import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import { UserWalletRepository } from 'src/crypto/user-wallet/infrastructure/repositories/user-wallet.repository';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { ReportStatus } from 'src/reports/domain/enums/report-status.enum';
import { ReportPeriod } from 'src/reports/domain/value-objects/report-period';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { DomainError } from 'src/shared/domain';
import { UserRole } from 'src/shared/enums/user-role.enum';

@Injectable()
export class TimesheetMonthClosingService {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly reportRepository: ReportRepository,
    private readonly walletRepository: UserWalletRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async prepare(params: {
    userId: string;
    month: number;
    year: number;
    hourlyRate: number;
    supervisorId?: string;
  }) {
    this.validateHourlyRate(params.hourlyRate);
    await this.validateSupervisor(params.supervisorId);
    await this.ensureEmployeeHasActiveWallet(params.userId);

    const period = ReportPeriod.create(
      Number(params.month),
      Number(params.year),
    );
    const employee = await this.userRepository.findById(params.userId, true);

    await this.deleteReplaceableReportOrFail({
      userId: params.userId,
      period,
    });

    const timesheets = await this.findTimesheetsForPeriod(
      params.userId,
      period,
    );
    const reportTimesheets = timesheets.map(timesheet => ({
      userId: String(timesheet.userId),
      hours: timesheet.hours,
    }));

    return {
      period,
      timesheets,
      reportTimesheets,
      employeeSignatureImage: employee.profile.signatureImageUrl,
    };
  }

  private validateHourlyRate(hourlyRate: number) {
    if (!hourlyRate || hourlyRate <= 0) {
      throw new DomainError(
        'INVALID_HOURLY_RATE',
        'El costo por hora es requerido y debe ser mayor a 0 para cerrar el mes.',
      );
    }
  }

  private async validateSupervisor(supervisorId?: string) {
    if (!supervisorId) return;

    const supervisor = await this.userRepository.findById(supervisorId);
    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new DomainError(
        'INVALID_SUPERVISOR',
        'El supervisor seleccionado no existe o no tiene el rol de supervisor.',
      );
    }
  }

  private async ensureEmployeeHasActiveWallet(userId: string) {
    const hasActiveWallet =
      await this.walletRepository.existsActiveByUserId(userId);
    if (!hasActiveWallet) {
      throw new DomainError(
        'EMPLOYEE_WALLET_REQUIRED',
        'No puedes cerrar el mes porque no tienes una wallet registrada. Ve a Configuración → Wallets y agrega una dirección de wallet para recibir pagos.',
      );
    }
  }

  private async deleteReplaceableReportOrFail(params: {
    userId: string;
    period: ReportPeriod;
  }) {
    const report = await this.reportRepository.findByPeriod(
      params.userId,
      params.period.month,
      params.period.year,
    );

    if (!report) return;

    const canReplace =
      report.status === ReportStatus.DRAFT ||
      report.status === ReportStatus.REJECTED;

    if (canReplace) {
      await this.reportRepository.deleteById(report.id);
      return;
    }

    throw new DomainError(
      'REPORT_ALREADY_EXISTS',
      `Ya existe un reporte en proceso para el periodo ${params.period.getLabel()}.`,
    );
  }

  private async findTimesheetsForPeriod(userId: string, period: ReportPeriod) {
    const { startDate, endDate } = period.getDateRange();

    return this.timesheetRepository.findByDateRange({
      userId,
      startDate,
      endDate,
    });
  }
}
