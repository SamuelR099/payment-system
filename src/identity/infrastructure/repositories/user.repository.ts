import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';

import { User, UserDocument } from '../schemas/user.schema';

type UserSelect = { [key in keyof UserDocument]?: boolean };

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  async findById(userId: string, failIfNotFound = false, select?: UserSelect) {
    const user = await this.userModel.findById(userId).select(select).exec();
    if (!user && failIfNotFound) {
      throw new NotFoundException(`User '${userId}' not found`);
    }
    return user;
  }

  async findByEmail(email: string, failIfNotFound = false) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user && failIfNotFound) {
      throw new NotFoundException(`User '${email}' not found`);
    }
    return user;
  }

  async findByPhone(phone: string, failIfNotFound = false) {
    const user = await this.userModel.findOne({ phone }).exec();
    if (!user && failIfNotFound) {
      throw new NotFoundException(`User '${phone}' not found`);
    }
    return user;
  }

  async update(id: string, data: UpdateQuery<UserDocument>) {
    return this.userModel
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .exec();
  }

  async updatePassword(userId: string, password: string) {
    return this.userModel.findByIdAndUpdate(userId, { password }).exec();
  }

  async findByIds(userIds: string[]) {
    return this.userModel
      .find({ _id: { $in: userIds } })
      .select('profile.firstName profile.lastName')
      .lean<
        {
          _id: Types.ObjectId;
          profile: { firstName: string; lastName: string };
        }[]
      >()
      .exec();
  }

  async findByRole(role: string) {
    return this.userModel
      .find({ role })
      .select('profile.firstName profile.lastName')
      .lean<
        {
          _id: Types.ObjectId;
          profile: { firstName: string; lastName: string };
        }[]
      >()
      .exec();
  }
}
