import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { CreateProjectCommand } from './create-project.command';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler
  implements ICommandHandler<CreateProjectCommand>
{
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(command: CreateProjectCommand) {
    const project = await this.projectRepository.create({
      userId: command.userId,
      name: command.name,
      description: command.description ?? '',
    });

    return {
      id: String(project._id),
      name: project.name,
      description: project.description,
    };
  }
}
