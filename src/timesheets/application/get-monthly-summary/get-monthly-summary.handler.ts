import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TimesheetRepository } from 'src/timesheets/infrastructure/repositories/timesheet.repository';
import { GetMonthlySummaryQuery } from './get-monthly-summary.query';
import { DomainError } from 'src/shared/domain';

@QueryHandler(GetMonthlySummaryQuery)
export class GetMonthlySummaryHandler implements IQueryHandler<GetMonthlySummaryQuery> {
  constructor(private readonly timesheetRepository: TimesheetRepository) {}

  async execute(query: GetMonthlySummaryQuery): Promise<{
    month: number;
    year: number;
    totalHours: number;
    totalFacturado: number;
    totalEntries: number;
    avgHoursPerDay: number;
    uniqueProjects: number;
    projectSummary: Record<string, number>;
    timesheets: any[];
  }> {
    const { userId, month, year } = query;

    if (!month || !year) {
      throw new DomainError('INVALID_QUERY', 'Month and year are required');
    }

    if (month < 1 || month > 12) {
      throw new DomainError('INVALID_MONTH', 'Month must be between 1 and 12');
    }

    if (year < 2000 || year > new Date().getFullYear() + 10) {
      throw new DomainError('INVALID_YEAR', 'Invalid year');
    }

  const { data: timesheets } = await this.timesheetRepository.search({ userId, month, year, limit: 1000 });

  const totalHours = await this.timesheetRepository.getHoursMonth(userId, month, year);
  const totalFacturado = timesheets.reduce((totalAmount, timesheet) => totalAmount + (timesheet.hours * timesheet.hourlyRate), 0);

    const projectSummary = timesheets.reduce((projectHoursMap, timesheet) => {
      if (!projectHoursMap[timesheet.project]) {
        projectHoursMap[timesheet.project] = 0;
      }
      projectHoursMap[timesheet.project] += timesheet.hours;
      return projectHoursMap;
    }, {});

    const avgHoursPerDay = totalHours / timesheets.length || 0;
    const uniqueProjects = Object.keys(projectSummary).length;

    return {
      month,
      year,
      totalHours,
      totalFacturado: Math.round(totalFacturado * 100) / 100,
      totalEntries: timesheets.length,
      avgHoursPerDay: Math.round(avgHoursPerDay * 100) / 100, // 2 decimales
      uniqueProjects,
      projectSummary,
      timesheets,
    };
  }
}
