import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { Multer } from 'multer';
import { SignTimesheetCommand } from './sign-timesheet.command';
import { TimesheetRepository } from '../../infrastructure/repositories/timesheet.repository';
import { DomainError } from 'src/shared/domain';
import { v4 as uuidv4 } from 'uuid';
import { TimesheetModel } from 'src/timesheets/domain/timesheet.model';
import { AwsS3Service } from '../../../file-management/infrastructure/aws-s3.service';
import { MediaFolder } from '../../domain/enums/media-folder.enum';

@CommandHandler(SignTimesheetCommand)
export class SignTimesheetHandler
  implements ICommandHandler<SignTimesheetCommand>
{
  constructor(
    private readonly timesheetRepository: TimesheetRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async execute(command: SignTimesheetCommand) {
    const { timesheetId, userId, file } = command;

    const signatureImageUrl = await this.uploadFile(timesheetId, file);

    const timesheetDocument =
      await this.timesheetRepository.findById(timesheetId);
    if (!timesheetDocument)
      throw new DomainError('TIMESHEET_NOT_FOUND', 'No existe el timesheet.');
    if (String(timesheetDocument.userId) !== String(userId))
      throw new DomainError('UNAUTHORIZED', 'No autorizado.');

    const timesheet = TimesheetModel.fromModel(timesheetDocument);
    const signedTimesheet = timesheet.sign(signatureImageUrl);

    const {
      id,
      userId: _userId,
      ...updateData
    } = signedTimesheet.getUserInfo();

    const updatedTimesheet = await this.timesheetRepository.updateById(
      timesheetId,
      updateData,
    );

    if (!updatedTimesheet)
      throw new DomainError('SIGN_FAILED', 'No se pudo firmar el timesheet.');

    return updatedTimesheet;
  }

  private async uploadFile(
    timesheetId: string,
    file?: Multer.File,
  ): Promise<string | undefined> {
    if (!file) {
      return undefined;
    }

    const fileName = `${uuidv4()}_${file.originalname}`;
    const filePath = `${MediaFolder}/${fileName}`;

    return this.awsS3Service.upload(filePath, file, 'private');
  }
}
