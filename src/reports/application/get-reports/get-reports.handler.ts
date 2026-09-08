import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReportsQuery } from './get-reports.query';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import {
  ReportRepository,
  SearchReportParams,
} from '../../infrastructure/repositories/report.repository';
import { UserRole } from 'src/shared/enums/user-role.enum';

@QueryHandler(GetReportsQuery)
export class GetReportsHandler implements IQueryHandler<GetReportsQuery> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetReportsQuery) {
    const isAdmin =
      query.userRole === UserRole.SUPERVISOR ||
      query.userRole === UserRole.ADMIN;

    const params: SearchReportParams = {
      status: query.status,
      cursor: query.cursor,
      userId: isAdmin ? undefined : query.userId,
      supervisorId:
        query.userRole === UserRole.SUPERVISOR ? query.userId : undefined,
    };

    const { data: reports, nextCursor } =
      await this.reportRepository.search(params);

    if (isAdmin) {
      const userIds = [
        ...new Set(reports.map(report => String(report.userId))),
      ];
      const users =
        userIds.length > 0 ? await this.userRepository.findByIds(userIds) : [];

      const userMap = new Map<string, { firstName: string; lastName: string }>(
        users.map(user => [
          String(user._id),
          {
            firstName: user.profile?.firstName ?? '',
            lastName: user.profile?.lastName ?? '',
          },
        ]),
      );

      const supervisorIds = [
        ...new Set(reports.map(report => report.supervisorId).filter(Boolean)),
      ];
      const supervisors =
        supervisorIds.length > 0
          ? await this.userRepository.findByIds(supervisorIds)
          : [];

      const supervisorMap = new Map<
        string,
        { firstName: string; lastName: string }
      >(
        supervisors.map(user => [
          String(user._id),
          {
            firstName: user.profile?.firstName ?? '',
            lastName: user.profile?.lastName ?? '',
          },
        ]),
      );

      const enrichedData = reports.map(report => {
        const user = userMap.get(String(report.userId));
        const supervisor = report.supervisorId
          ? supervisorMap.get(String(report.supervisorId))
          : undefined;
        return {
          ...report,
          firstName: user?.firstName ?? '',
          lastName: user?.lastName ?? '',
          supervisorName:
            supervisor && (supervisor.firstName || supervisor.lastName)
              ? `${supervisor.firstName} ${supervisor.lastName}`.trim()
              : undefined,
        };
      });

      return { data: enrichedData, nextCursor };
    }

    return { data: reports, nextCursor };
  }
}
