import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ReportStatus } from '../../domain/enums/report-status.enum';

export type ReportDocument = Report & Document;

@Schema({ collection: 'reports' })
export class Report {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  month: number;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  totalHours: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, enum: Object.values(ReportStatus) })
  status: ReportStatus;

  @Prop({ default: false })
  employeeSigned: boolean;

  @Prop()
  employeeSignatureImage?: string;

  @Prop()
  employeeSignedAt?: Date;

  @Prop({ default: false })
  adminSigned: boolean;

  @Prop()
  adminSignatureImage?: string;

  @Prop()
  adminSignedAt?: Date;

  @Prop()
  adminId?: string;

  @Prop()
  pdfPath?: string;

  @Prop()
  paymentId?: string;

  @Prop()
  paidAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

ReportSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
ReportSchema.index({ userId: 1, status: 1 });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ paymentId: 1 }, { sparse: true });
ReportSchema.index({ adminId: 1, status: 1 });