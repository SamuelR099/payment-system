import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReportsQuery } from './get-reports.query';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import {
  ReportRepository,
  SearchReportParams,
} from '../../infrastructure/repositories/report.repository';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { ReportStatus } from '../../domain/enums/report-status.enum';

@QueryHandler(GetReportsQuery)
export class GetReportsHandler implements IQueryHandler<GetReportsQuery> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetReportsQuery) {
    const includeUsers =
      query.userRole === UserRole.SUPERVISOR ||
      query.userRole === UserRole.ADMIN;
    const params = this.buildSearchParams(query);
    const { data: reports, nextCursor } =
      await this.reportRepository.search(params);

    if (includeUsers) {
      const data = await this.enrichReports(reports);
      return { data, nextCursor };
    }

    return { data: reports, nextCursor };
  }

  private buildSearchParams(query: GetReportsQuery): SearchReportParams {
    if (query.userRole === UserRole.ADMIN) {
      return {
        status: ReportStatus.APPROVED,
        cursor: query.cursor,
      };
    }

    return {
      status: query.status,
      cursor: query.cursor,
      userId: query.userRole === UserRole.EMPLOYEE ? query.userId : undefined,
      supervisorId:
        query.userRole === UserRole.SUPERVISOR ? query.userId : undefined,
    };
  }

  private async enrichReports(reports: any[]) {
    const userIds = [
      ...new Set(
        reports.flatMap(report => [
          String(report.userId),
          report.supervisorId ? String(report.supervisorId) : undefined,
        ]),
      ),
    ].filter(Boolean);

    const usersById = await this.getUsersById(userIds);

    reports.forEach(report => {
      const user = usersById[String(report.userId)];
      const supervisor = report.supervisorId
        ? usersById[String(report.supervisorId)]
        : undefined;

      report.firstName = user?.firstName ?? '';
      report.lastName = user?.lastName ?? '';
      report.supervisorName = supervisor
        ? this.getFullName(supervisor.firstName, supervisor.lastName)
        : undefined;
    });

    return reports;
  }

  private async getUsersById(userIds: string[]) {
    const usersById = {};

    if (userIds.length === 0) return usersById;

    const users = await this.userRepository.findByIds(userIds);

    users.forEach(user => {
      usersById[String(user._id)] = {
        firstName: user.profile?.firstName ?? '',
        lastName: user.profile?.lastName ?? '',
      };
    });

    return usersById;
  }

  private getFullName(firstName = '', lastName = '') {
    if (!firstName && !lastName) return undefined;
    return `${firstName} ${lastName}`.trim();
  }
}
