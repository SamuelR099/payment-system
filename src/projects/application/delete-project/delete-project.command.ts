export class DeleteProjectCommand {
  readonly projectId: string;
  readonly userId: string;

  constructor(data: DeleteProjectCommand) {
    Object.assign(this, data);
  }
}
