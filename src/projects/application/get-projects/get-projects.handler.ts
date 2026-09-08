import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { GetProjectsQuery } from './get-projects.query';

@QueryHandler(GetProjectsQuery)
export class GetProjectsHandler implements IQueryHandler<GetProjectsQuery> {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(query: GetProjectsQuery) {
    const { data: projects, nextCursor } = await this.projectRepository.search({
      userId: query.userId,
      cursor: query.cursor,
    });

    return {
      data: projects.map(project => ({
        id: String(project._id),
        name: project.name,
        description: project.description,
      })),
      nextCursor,
    };
  }
}
