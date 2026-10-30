export class GetFileQuery {
  constructor(
    readonly fileId: string,
    readonly accessToken: string,
  ) {}
}
