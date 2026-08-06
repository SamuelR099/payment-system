import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hash } from 'bcrypt';
import { Seeder } from 'nestjs-seeder';
import {
  User,
  UserDocument,
} from 'src/identity/infrastructure/schemas/user.schema';
import { UserRole } from 'src/shared/enums/user-role.enum';

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async seed() {
    const supervisors = [
      {
        email: 'supervisor1@example.com',
        password: await hash('password123', 10),
        role: UserRole.SUPERVISOR,
        profile: {
          firstName: 'Carlos',
          lastName: 'Rodriguez',
        },
      },
      {
        email: 'supervisor2@example.com',
        password: await hash('password123', 10),
        role: UserRole.SUPERVISOR,
        profile: {
          firstName: 'Maria',
          lastName: 'Gonzalez',
        },
      },
    ];

    const admins = [
      {
        email: 'admin@example.com',
        password: await hash('password123', 10),
        role: UserRole.ADMIN,
        profile: {
          firstName: 'Admin',
          lastName: 'Principal',
        },
      },
    ];

    for (const supervisor of supervisors) {
      await this.userModel.findOneAndUpdate(
        { email: supervisor.email },
        supervisor,
        { upsert: true, new: true },
      );
    }

    for (const admin of admins) {
      await this.userModel.findOneAndUpdate({ email: admin.email }, admin, {
        upsert: true,
        new: true,
      });
    }

    return { supervisors: supervisors.length, admins: admins.length };
  }

  async drop() {
    await this.userModel.deleteMany({
      email: {
        $in: [
          'supervisor1@example.com',
          'supervisor2@example.com',
          'admin@example.com',
        ],
      },
    });
  }
}
