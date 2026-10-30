import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { GridFsService } from 'src/file-management/infrastructure/gridfs.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { UploadUserSignatureCommand } from './upload-user-signature.command';

const SIGNATURE_FOLDER = 'user-signatures';

@CommandHandler(UploadUserSignatureCommand)
export class UploadUserSignatureHandler
  implements ICommandHandler<UploadUserSignatureCommand>
{
  constructor(
    private readonly gridFsService: GridFsService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UploadUserSignatureCommand) {
    const { userId, file } = command;

    const user = await this.userRepository.findById(userId, true);

    if (user.profile?.signatureImageUrl) {
      await this.gridFsService.remove(user.profile.signatureImageUrl);
    }

    const ext = file.originalname.split('.').pop() ?? 'png';
    const fileName = `${SIGNATURE_FOLDER}/user-${userId}-${uuidv4()}.${ext}`;

    const signatureUrl = await this.gridFsService.upload(
      fileName,
      file,
      'private',
    );

    await this.userRepository.update(userId, {
      'profile.signatureImageUrl': signatureUrl,
    });

    return { signatureUrl };
  }

}
