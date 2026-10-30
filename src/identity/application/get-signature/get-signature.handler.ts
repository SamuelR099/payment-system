import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetSignatureQuery } from './get-signature.query';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { GridFsService } from 'src/file-management/infrastructure/gridfs.service';

@QueryHandler(GetSignatureQuery)
export class GetSignatureHandler implements IQueryHandler<GetSignatureQuery> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly gridFsService: GridFsService,
  ) {}

  async execute(
    query: GetSignatureQuery,
  ): Promise<{ signatureUrl: string | null }> {
    const user = await this.userRepository.findById(query.userId, false);
    const rawUrl = user?.profile?.signatureImageUrl;

    if (!rawUrl) return { signatureUrl: null };

    const signatureUrl = await this.gridFsService.getSignedUrl(rawUrl, 3600);

    return { signatureUrl };
  }
}
