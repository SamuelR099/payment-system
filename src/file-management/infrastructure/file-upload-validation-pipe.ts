import { ParseFilePipe, ParseFilePipeBuilder } from '@nestjs/common/pipes';
import {
  Inject,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DomainError } from 'src/shared/domain';

type FileUploadValidationPipeParams = {
  allowedTypes: RegExp;
  maxSizeInBytes: number;
  isOptional?: boolean;
};

@Injectable()
export class FileUploadValidationPipe implements PipeTransform {
  private static DEFAULT_IMAGE_TYPES = /jpeg|jpg|png/;
  private static DEFAULT_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;
  private static DEFAULT_MULTIMEDIA_TYPES =
    /jpeg|jpg|png|mp4|mov|avi|wmv|flv|mp3|wav|ogg/;
  private static DEFAULT_MULTIMEDIA_SIZE_IN_BYTES = 10 * 1024 * 1024;

  private readonly filePipe: ParseFilePipe;
  private readonly isOptional: boolean;

  constructor(
    @Inject('FILE_MANAGEMENT_CONFIG')
    config: FileUploadValidationPipeParams = {
      allowedTypes: FileUploadValidationPipe.DEFAULT_IMAGE_TYPES,
      maxSizeInBytes: FileUploadValidationPipe.DEFAULT_IMAGE_SIZE_IN_BYTES,
    },
  ) {
    this.isOptional = config.isOptional || false;

    this.filePipe = new ParseFilePipeBuilder()
      .addFileTypeValidator({ fileType: config.allowedTypes })
      .addMaxSizeValidator({
        maxSize:
          config.maxSizeInBytes ||
          FileUploadValidationPipe.DEFAULT_IMAGE_SIZE_IN_BYTES,
      })
      .build();
  }

  transform(value: any) {
    if (this.isOptional && !value) {
      return value;
    }
    try {
      return this.filePipe.transform(value);
    } catch (error) {
      throw new UnprocessableEntityException(
        error.message || 'Invalid file upload',
      );
    }
  }
}
