import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { UploadUserSignatureCommand } from './upload-user-signature.command';

const SIGNATURE_FOLDER = 'user-signatures';

@CommandHandler(UploadUserSignatureCommand)
export class UploadUserSignatureHandler
  implements ICommandHandler<UploadUserSignatureCommand>
{
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UploadUserSignatureCommand) {
    const { userId, file } = command;

    const user = await this.userRepository.findById(userId, true);

    if (user.profile?.signatureImageUrl) {
      const oldKey = this.extractKeyFromUrl(user.profile.signatureImageUrl);
      if (oldKey) {
        await this.awsS3Service.remove(oldKey);
      }
    }

    const ext = file.originalname.split('.').pop() ?? 'png';
    const fileName = `${SIGNATURE_FOLDER}/user-${userId}-${uuidv4()}.${ext}`;

    const signatureUrl = await this.awsS3Service.upload(
      fileName,
      file,
      'private',
    );

    await this.userRepository.update(userId, {
      'profile.signatureImageUrl': signatureUrl,
    });

    return { signatureUrl };
  }

  private extractKeyFromUrl(url: string): string | null {
    if (!url.includes('amazonaws.com/')) return null;
    return url.split('amazonaws.com/').pop() ?? null;
  }
}
