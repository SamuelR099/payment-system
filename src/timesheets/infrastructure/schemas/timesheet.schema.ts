import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'timesheets', timestamps: true })
export class Timesheet {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true, maxlength: 100 })
  project: string;

  @Prop({ required: true, maxlength: 500 })
  description: string;

  @Prop({ required: true, min: 1, max: 24 })
  hours: number;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export type TimesheetDocument = Timesheet & Document;

export const TimesheetSchema = SchemaFactory.createForClass(Timesheet);

// Indexes for better performance
TimesheetSchema.index({ userId: 1, date: -1 });
TimesheetSchema.index({ userId: 1, createdAt: -1 });
TimesheetSchema.index({ userId: 1, project: 1, date: -1 });
TimesheetSchema.index({ date: -1, createdAt: -1 });
