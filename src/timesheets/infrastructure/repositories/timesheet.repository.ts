import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Timesheet, TimesheetDocument } from '../schemas/timesheet.schema';

@Injectable()
export class TimesheetRepository {
  private readonly DEFAULT_PAGE_SIZE = 30;

  async search(params: {
    userId: string;
    month?: number;
    year?: number;
    startDate?: Date;
    endDate?: Date;
    cursor?: string;
    limit?: number;
    status?: string;
    terms?: string;
  }) {
    const {
      userId,
      month,
      year,
      startDate,
      endDate,
      cursor,
      limit,
      status,
      terms,
    } = params;
    const pageSize = limit ?? this.DEFAULT_PAGE_SIZE;

    const filter: any = {
      $and: [
        {
          $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
        },
      ],
    };

    if (startDate && endDate) {
      filter.$and.push({ date: { $gte: startDate, $lte: endDate } });
    } else if (month && year) {
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      filter.$and.push({ date: { $gte: start, $lte: end } });
    }

    if (status) {
      filter.$and.push({ status });
    }

    if (terms) {
      filter.$and.push({
        $or: [
          { project: { $regex: terms, $options: 'i' } },
          { description: { $regex: terms, $options: 'i' } },
        ],
      });
    }

    if (cursor) {
      filter.$and.push({ _id: { $lt: new Types.ObjectId(cursor) } });
    }

    const data = await this.timesheetModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(pageSize)
      .lean()
      .exec();

    const nextCursor =
      data.length < pageSize ? null : String(data[data.length - 1]._id);
    return { data, nextCursor };
  }

  constructor(
    @InjectModel(Timesheet.name)
    private readonly timesheetModel: Model<TimesheetDocument>,
  ) {}

  async create(timesheetData: any) {
    const timesheet = new this.timesheetModel(timesheetData);
    return timesheet.save();
  }

  async findById(id: string) {
    return this.timesheetModel.findById(id).exec();
  }

  async updateById(id: string, updateData: any) {
    const updated = await this.timesheetModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Timesheet '${id}' not found`);
    return updated;
  }

  async deleteById(id: string) {
    const result = await this.timesheetModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Timesheet '${id}' not found`);
    return !!result;
  }

  async countByUserId(userId: string) {
    return this.timesheetModel
      .countDocuments({
        $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
      })
      .lean()
      .exec();
  }

  async getHoursMonth(userId: string, month: number, year: number) {
    const { data } = await this.search({ userId, month, year, limit: 1000 });
    return data.reduce((total, timesheet) => total + timesheet.hours, 0);
  }

  async existsDuplicateOnDate(params: {
    userId: string;
    project: string;
    date: Date;
    excludeTimesheetId?: string;
  }) {
    const filter: any = {
      $and: [
        {
          $or: [
            { userId: params.userId },
            { userId: new Types.ObjectId(params.userId) },
          ],
        },
        { project: params.project },
        { date: params.date },
      ],
    };
    if (params.excludeTimesheetId) {
      filter.$and.push({
        _id: { $ne: new Types.ObjectId(params.excludeTimesheetId) },
      });
    }
    const count = await this.timesheetModel.countDocuments(filter).exec();
    return count > 0;
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.timesheetModel
      .find({
        date: { $gte: startDate, $lte: endDate },
      })
      .lean()
      .exec();
  }

  async findByMonthAndYear(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return this.findByDateRange(startDate, endDate);
  }

  async unsignAllByPeriod(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    await this.timesheetModel.updateMany(
      {
        $and: [
          {
            $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
          },
          { date: { $gte: startDate, $lte: endDate } },
        ],
      },
      {
        $set: {
          signed: false,
          signatureImageUrl: undefined,
          signedAt: undefined,
        },
      },
    );
  }

  async signAllByPeriod(
    userId: string,
    month: number,
    year: number,
    signatureImageUrl: string,
  ) {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const now = new Date();
    await this.timesheetModel.updateMany(
      {
        $and: [
          {
            $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
          },
          { date: { $gte: startDate, $lte: endDate } },
        ],
      },
      {
        $set: {
          signed: true,
          signatureImageUrl: signatureImageUrl,
          signedAt: now,
          updatedAt: now,
        },
      },
    );
  }
}
