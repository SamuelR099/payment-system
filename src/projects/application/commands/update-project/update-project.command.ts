export class UpdateProjectCommand {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly name?: string,
    public readonly description?: string,
  ) {}
}
