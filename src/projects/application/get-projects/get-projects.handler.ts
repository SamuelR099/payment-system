import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProjectRepository } from '../../../infrastructure/repositories/project.repository';
import { GetProjectsQuery } from './get-projects.query';

@QueryHandler(GetProjectsQuery)
export class GetProjectsHandler implements IQueryHandler<GetProjectsQuery> {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(query: GetProjectsQuery) {
    const projects = await this.projectRepository.findAllByUser(query.userId);

    return projects.map(project => ({
      id: String(project._id),
      name: project.name,
      description: project.description,
    }));
  }
}
