import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Language, UserRole, EmployeePosition } from 'src/shared/enums';

@Schema({ _id: false })
export class Address { }

@Schema({ _id: false })
export class UserProfile {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({
    default: {},
    type: SchemaFactory.createForClass(Address),
  })
  address?: Address;

  @Prop()
  avatarUrl?: string;

  @Prop({
    enum: Object.values(EmployeePosition),
  })
  position?: EmployeePosition;
}

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true, lowercase: true })
  email?: string;

  @Prop({ sparse: true })
  phone?: string;

  @Prop()
  password?: string;

  @Prop({
    default: {},
    type: SchemaFactory.createForClass(UserProfile),
  })
  profile: UserProfile;

  @Prop({ default: Language.Spanish })
  language: Language;

  @Prop({
    enum: Object.values(UserRole),
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Prop()
  wallet?: string;

  @Prop()
  hourlyRate?: number;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { sparse: true });
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
