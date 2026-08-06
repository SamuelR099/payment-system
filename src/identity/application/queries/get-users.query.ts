export class GetUsersQuery {
  readonly role?: string;

  constructor(data: GetUsersQuery) {
    Object.assign(this, data);
  }
}
