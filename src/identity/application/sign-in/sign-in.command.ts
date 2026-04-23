export class SignInCommand {
  readonly email: string;
  readonly password: string;
  constructor(data: SignInCommand) {
    Object.assign(this, data);
  }
}
