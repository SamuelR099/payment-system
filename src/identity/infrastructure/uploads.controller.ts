import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus } from '@nestjs/cqrs';
import type { Multer } from 'multer';

import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { FileUploadValidationPipe } from 'src/file-management/infrastructure/file-upload-validation-pipe';
import { UploadUserSignatureCommand } from '../application/upload-user-signature/upload-user-signature.command';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/user-signature')
  @Roles([UserRole.EMPLOYEE, UserRole.SUPERVISOR, UserRole.ADMIN])
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserSignature(
    @Req() req: { user?: { userId: string } },
    @UploadedFile(
      new FileUploadValidationPipe({
        allowedTypes: /jpeg|jpg|png/,
        maxSizeInBytes: 5 * 1024 * 1024,
      }),
    )
    file: Multer.File,
  ) {
    return this.commandBus.execute(
      new UploadUserSignatureCommand(req.user.userId, file),
    );
  }
}
