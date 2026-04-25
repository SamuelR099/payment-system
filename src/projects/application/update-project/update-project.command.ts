export class UpdateProjectCommand {
  readonly projectId: string;
  readonly userId: string;
  readonly name?: string;
  readonly description?: string;

  constructor(data: UpdateProjectCommand) {
    Object.assign(this, data);
  }
}
