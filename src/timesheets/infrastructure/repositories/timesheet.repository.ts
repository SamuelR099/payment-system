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
    cursor?: string;
    limit?: number;
  }) {
    const { userId, month, year, cursor, limit } = params;
    const pageSize = limit ?? this.DEFAULT_PAGE_SIZE;
    const filter: any = { userId: new Types.ObjectId(userId) };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (cursor) {
      filter._id = { $lt: new Types.ObjectId(cursor) };
    }

    const query = this.timesheetModel.find(filter).sort({ _id: -1 });
  const data = await query.limit(pageSize).lean().exec();
  const nextCursor = data.length < pageSize ? null : String(data[data.length - 1]._id);
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

  async updateById(
    id: string,
    updateData: Partial<Timesheet>,
  ) {
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
      .countDocuments({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async getHoursMonth(
    userId: string,
    month: number,
    year: number,
  ) {
    const { data } = await this.search({ userId, month, year, limit: 1000 });
    return data.reduce((total, timesheet) => total + timesheet.hours, 0);
  }

  async existsDuplicateOnDate(params: {
    userId: string;
    project: string;
    date: Date;
    excludeTimesheetId?: string;
  }): Promise<boolean> {
    const filter: any = {
      userId: new Types.ObjectId(params.userId),
      project: params.project,
      date: params.date,
    };
    if (params.excludeTimesheetId) {
      filter._id = { $ne: new Types.ObjectId(params.excludeTimesheetId) };
    }
    const count = await this.timesheetModel.countDocuments(filter).exec();
    return count > 0;
  }
}
