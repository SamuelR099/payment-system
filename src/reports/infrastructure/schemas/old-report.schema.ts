import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OldReportDocument = OldReport & Document;

@Schema({ collection: 'old_reports', timestamps: true })
export class OldReport {
  @Prop({ required: true })
  pdfFileName: string;

  @Prop({ required: true })
  referenceMonth: number;

  @Prop({ required: true })
  referenceYear: number;

  @Prop({ required: true })
  pdfPath: string;

  @Prop({ required: true })
  uploadedBy: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const OldReportSchema = SchemaFactory.createForClass(OldReport);

OldReportSchema.index({ referenceYear: 1, referenceMonth: 1 });
OldReportSchema.index({ uploadedBy: 1 });
