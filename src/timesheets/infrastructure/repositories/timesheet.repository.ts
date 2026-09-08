import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Timesheet, TimesheetDocument } from '../schemas/timesheet.schema';
import { getMonthRange } from 'src/shared/utils';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

@Injectable()
export class TimesheetRepository {
  constructor(
    @InjectModel(Timesheet.name)
    private readonly timesheetModel: Model<TimesheetDocument>,
  ) {}

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
    const pageSize = limit ?? DEFAULT_PAGE_SIZE;

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
      const { startDate: start, endDate: end } = getMonthRange(month, year);
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
      .limit(pageSize + 1)
      .lean()
      .exec();

    const hasNextPage = data.length > pageSize;
    const pageData = hasNextPage ? data.slice(0, pageSize) : data;
    const nextCursor = hasNextPage
      ? String(pageData[pageData.length - 1]._id)
      : null;
    return { data: pageData, nextCursor };
  }

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

  async getTotalHoursByMonth(params: {
    userId?: string;
    month: number;
    year: number;
  }) {
    const { startDate, endDate } = getMonthRange(params.month, params.year);
    const rows = await this.getHoursByDateRange({
      userId: params.userId,
      startDate,
      endDate,
    });

    return rows.reduce((total, row) => total + row.hours, 0);
  }

  async getHoursByDateRange(params: {
    userId?: string;
    startDate: Date;
    endDate: Date;
  }) {
    const filter: any = {
      date: { $gte: params.startDate, $lte: params.endDate },
    };

    if (params.userId) {
      filter.$or = [
        { userId: params.userId },
        { userId: new Types.ObjectId(params.userId) },
      ];
    }

    const rows = await this.timesheetModel
      .aggregate<{ date: string; hours: number }>([
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$date',
              },
            },
            hours: { $sum: '$hours' },
          },
        },
        { $project: { _id: 0, date: '$_id', hours: 1 } },
        { $sort: { date: 1 } },
      ])
      .exec();

    return rows;
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

}
