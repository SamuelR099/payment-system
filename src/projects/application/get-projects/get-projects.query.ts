export class GetProjectsQuery {
  readonly userId: string;
  readonly cursor?: string;

  constructor(data: GetProjectsQuery) {
    Object.assign(this, data);
  }
}
