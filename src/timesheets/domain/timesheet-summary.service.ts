import { Injectable } from '@nestjs/common';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';

interface TimesheetRaw {
  id?: string;
  _id?: any;
  userId?: string;
  date?: string | Date;
  project?: string;
  description?: string;
  hours?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProjectSummary {
  project: string;
  hours: number;
}
@Injectable()
export class TimesheetSummaryService {
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private static readonly MAX_RESULTS = 1000;

  async getMonthlySummary(userId: string, month: number, year: number) {
    const timesheetList = await this.fetchTimesheets(userId, month, year);
    const totalWorkedHours = this.calculateTotalHours(timesheetList);
    const user = await this.userRepository.findById(userId, true);
    const hourlyRate = user?.profile?.hourlyRate ?? 0;
    const totalBilledAmount = this.calculateTotalBilled(
      timesheetList,
      hourlyRate,
    );
    const projectSummary = this.buildProjectSummary(timesheetList);
    const averageHoursPerDay = this.calculateAverageHoursPerDay(
      totalWorkedHours,
      timesheetList.length,
    );
    const timesheets = timesheetList.map(this.mapTimesheet);
    return {
      month,
      year,
      totalHours: totalWorkedHours,
      totalFacturado: Math.round(totalBilledAmount * 100) / 100,
      totalEntries: timesheetList.length,
      avgHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
      uniqueProjects: projectSummary.length,
      projectSummary,
      timesheets,
    };
  }

  private async fetchTimesheets(
    userId: string,
    month: number,
    year: number,
  ): Promise<any[]> {
    const { data } = await this.timesheetRepository.search({
      userId,
      month,
      year,
      limit: TimesheetSummaryService.MAX_RESULTS,
    });
    return data;
  }

  private calculateTotalHours(timesheetList: TimesheetRaw[]): number {
    return timesheetList.reduce(
      (total, timesheet) => total + (timesheet.hours ?? 0),
      0,
    );
  }

  private calculateTotalBilled(
    timesheetList: TimesheetRaw[],
    hourlyRate: number,
  ): number {
    return timesheetList.reduce(
      (sum, timesheet) => sum + (timesheet.hours ?? 0) * hourlyRate,
      0,
    );
  }

  private buildProjectSummary(timesheetList: TimesheetRaw[]): ProjectSummary[] {
    const grouped: Record<string, number> = {};
    for (const timesheet of timesheetList) {
      if (!timesheet.project) continue;
      grouped[timesheet.project] =
        (grouped[timesheet.project] || 0) + (timesheet.hours ?? 0);
    }
    return Object.entries(grouped).map(([project, hours]) => ({
      project,
      hours,
    }));
  }

  private calculateAverageHoursPerDay(total: number, entries: number): number {
    return entries > 0 ? total / entries : 0;
  }

  private mapTimesheet(document: any) {
    return {
      id: document._id?.toString?.() ?? '',
      userId: document.userId?.toString?.() ?? '',
      date: document.date,
      project: document.project,
      description: document.description,
      hours: document.hours,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
