export class GetUsersQuery {
  readonly userId?: string;
  readonly role?: string;

  constructor(data: GetUsersQuery) {
    Object.assign(this, data);
  }
}
