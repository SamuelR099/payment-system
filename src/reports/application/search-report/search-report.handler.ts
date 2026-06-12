import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchReportQuery } from './search-report.query';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import {
  ReportRepository,
  SearchReportParams,
} from '../../infrastructure/repositories/report.repository';
import { UserRole } from 'src/shared/enums/user-role.enum';

@QueryHandler(SearchReportQuery)
export class SearchReportHandler implements IQueryHandler<SearchReportQuery> {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: SearchReportQuery) {
    const isAdmin = query.userRole === UserRole.ADMIN || query.userRole === UserRole.SUPER_ADMIN;

    const params: SearchReportParams = {
      terms: query.terms,
      status: query.status,
      cursor: query.cursor,
      userId: isAdmin ? undefined : query.userId,
    };

    const { data: reports, nextCursor } = await this.reportRepository.search(
      params,
      query.limit,
    );

    if (isAdmin) {
      const userIds = [...new Set(reports.map((report) => String(report.userId)))];
      const users = userIds.length > 0 ? await this.userRepository.findByIds(userIds) : [];

      const userMap = new Map<string, { firstName: string; lastName: string }>(
        users.map((user) => [
          String(user._id),
          {
            firstName: user.profile?.firstName ?? '',
            lastName: user.profile?.lastName ?? '',
          },
        ]),
      );

      const enrichedData = reports.map((report) => {
        const user = userMap.get(String(report.userId));
        return {
          ...report,
          firstName: user?.firstName ?? '',
          lastName: user?.lastName ?? '',
        };
      });

      return { data: enrichedData, nextCursor };
    }

    return { data: reports, nextCursor };
  }
}