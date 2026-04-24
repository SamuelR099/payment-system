import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'projects', timestamps: true })
export class Project {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ required: false, maxlength: 500, default: '' })
  description: string;
}

export type ProjectDocument = Project & Document;

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ userId: 1, createdAt: -1 });
