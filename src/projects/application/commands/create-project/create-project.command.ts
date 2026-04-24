export class CreateProjectCommand {
  readonly userId: string;
  readonly name: string;
  readonly description?: string;

  constructor(data: CreateProjectCommand) {
    Object.assign(this, data);
  }
}
