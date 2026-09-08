import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetSignatureQuery } from './get-signature.query';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';

@QueryHandler(GetSignatureQuery)
export class GetSignatureHandler implements IQueryHandler<GetSignatureQuery> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async execute(
    query: GetSignatureQuery,
  ): Promise<{ signatureUrl: string | null }> {
    const user = await this.userRepository.findById(query.userId, false);
    const rawUrl = user?.profile?.signatureImageUrl;

    if (!rawUrl) return { signatureUrl: null };

    const signatureUrl = await this.awsS3Service.getSignedUrl(rawUrl, 3600);

    return { signatureUrl };
  }
}