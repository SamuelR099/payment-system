export class UpdateUserProfileCommand {
  readonly userId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly position?: string;
  readonly hourlyRate?: number;

  constructor(data: UpdateUserProfileCommand) {
    Object.assign(this, data);
  }
}
