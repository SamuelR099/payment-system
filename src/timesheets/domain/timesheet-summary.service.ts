import { Injectable } from '@nestjs/common';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { MonthlySummaryResponseDto, MonthlySummaryProjectDto, TimesheetDto } from 'src/timesheets/infrastructure/dto/monthly-summary-response.dto';

@Injectable()
export class TimesheetSummaryService {
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  private static readonly MAX_RESULTS = 1000;

  async getMonthlySummary(userId: string, month: number, year: number) {
  const { data: timesheetList } = await this.timesheetRepository.search({ userId, month, year, limit: TimesheetSummaryService.MAX_RESULTS });
  const totalWorkedHours = await this.timesheetRepository.getHoursMonth(userId, month, year);
  const totalBilledAmount = this.getTotalBilled(timesheetList);
  const projectSummary = this.getProjectSummary(timesheetList);
  const averageHoursPerDay = this.getAverageHoursPerDay(totalWorkedHours, timesheetList.length);
  const timesheets: TimesheetDto[] = timesheetList.map(this.toTimesheetDto);

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

  private getTotalBilled(timesheetList: any[]): number {
    return timesheetList.reduce((sum, timesheet) => sum + (timesheet.hours * timesheet.hourlyRate), 0);
  }

  private getProjectSummary(timesheetList: any[]): MonthlySummaryProjectDto[] {
    const hoursGroupedByProject: Record<string, number> = {};
    for (const timesheet of timesheetList) {
      hoursGroupedByProject[timesheet.project] = (hoursGroupedByProject[timesheet.project] || 0) + timesheet.hours;
    }
    return Object.entries(hoursGroupedByProject).map(([project, hours]) => ({ project, hours }));
  }

  private getAverageHoursPerDay(totalWorkedHours: number, totalEntries: number): number {
    return totalEntries > 0 ? totalWorkedHours / totalEntries : 0;
  }

  private toTimesheetDto(timesheet: any): TimesheetDto {
    if (!timesheet.id && !timesheet._id) throw new Error('El timesheet no tiene identificador.');
    if (!timesheet.date || !timesheet.createdAt || !timesheet.updatedAt) throw new Error('El timesheet no tiene todas las fechas requeridas.');
    return {
      id: timesheet.id ?? timesheet._id?.toString?.(),
      userId: timesheet.userId,
      date: timesheet.date,
      project: timesheet.project,
      description: timesheet.description,
      hours: timesheet.hours,
      hourlyRate: timesheet.hourlyRate,
      createdAt: timesheet.createdAt,
      updatedAt: timesheet.updatedAt,
    };
  }
  }

