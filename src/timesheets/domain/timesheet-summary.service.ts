import { Injectable } from '@nestjs/common';
import { TimesheetModel } from 'src/timesheets/domain/timesheet.model';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';

interface TimesheetRaw {
  id?: string;
  _id?: any;
  userId?: string;
  date?: string | Date;
  project?: string;
  description?: string;
  hours?: number;
  hourlyRate?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProjectSummary {
  project: string;
  hours: number;
}
@Injectable()
export class TimesheetSummaryService {
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  private static readonly MAX_RESULTS = 1000;

  async getMonthlySummary(userId: string, month: number, year: number) {
    const timesheetList = await this.fetchTimesheets(userId, month, year);
    const totalWorkedHours = await this.getTotalWorkedHours(
      userId,
      month,
      year,
    );
    const totalBilledAmount = this.calculateTotalBilled(timesheetList);
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

  private async getTotalWorkedHours(
    userId: string,
    month: number,
    year: number,
  ): Promise<number> {
    return this.timesheetRepository.getHoursMonth(userId, month, year);
  }

  private calculateTotalBilled(timesheetList: TimesheetRaw[]): number {
    return timesheetList.reduce(
      (sum, timesheet) =>
        sum + (timesheet.hours ?? 0) * (timesheet.hourlyRate ?? 0),
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
    return TimesheetModel.fromModel(document).getUserInfo();
  }
}
