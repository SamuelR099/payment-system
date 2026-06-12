import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'timesheets', timestamps: true })
export class Timesheet {
  static fromModel(arg0: any) {
    throw new Error('Method not implemented.');
  }
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, maxlength: 100 })
  project: string;

  @Prop({ required: true, maxlength: 500 })
  description: string;

  @Prop({ required: true, min: 0.25, max: 24 })
  hours: number;

  @Prop({ required: true, min: 0 })
  hourlyRate: number;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ default: false })
  signed?: boolean;

  @Prop()
  signedAt?: Date;

  @Prop({ required: false })
  signatureImageUrl?: string;
}

export type TimesheetDocument = Timesheet & Document;

export const TimesheetSchema = SchemaFactory.createForClass(Timesheet);

// Indexes for better performance
TimesheetSchema.index({ userId: 1, date: -1 });
TimesheetSchema.index({ userId: 1, createdAt: -1 });
TimesheetSchema.index({ userId: 1, project: 1, date: -1 });
TimesheetSchema.index({ signed: 1, date: -1 });
TimesheetSchema.index({ date: -1, createdAt: -1 });
