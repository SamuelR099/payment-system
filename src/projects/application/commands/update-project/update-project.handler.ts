import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProjectRepository } from '../../../infrastructure/repositories/project.repository';
import { UpdateProjectCommand } from './update-project.command';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler
  implements ICommandHandler<UpdateProjectCommand>
{
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(command: UpdateProjectCommand) {
    const project = await this.projectRepository.update(
      command.projectId,
      command.userId,
      {
        name: command.name,
        description: command.description,
      },
    );

    return {
      id: String(project._id),
      name: project.name,
      description: project.description,
    };
  }
}
