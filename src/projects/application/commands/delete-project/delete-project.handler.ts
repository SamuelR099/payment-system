import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProjectRepository } from '../../../infrastructure/repositories/project.repository';
import { DeleteProjectCommand } from './delete-project.command';

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler
  implements ICommandHandler<DeleteProjectCommand>
{
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(command: DeleteProjectCommand) {
    await this.projectRepository.delete(command.projectId, command.userId);
    return { success: true };
  }
}
