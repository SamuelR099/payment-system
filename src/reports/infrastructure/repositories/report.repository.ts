import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

import { Report, ReportDocument } from '../schemas/report.schema';

export type SearchReportParams = {
  terms?: string;
  status?: string;
  cursor?: string;
};

@Injectable()
export class ReportRepository {
  private readonly DEFAULT_PAGE_SIZE = 20;

  constructor(
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
  ) {}

  async findById(reportId: string, failIfNotFound = false) {
    const report = await this.reportModel.findById(reportId).exec();
    if (!report && failIfNotFound) {
      throw new NotFoundException(`Report with ID '${reportId}' not found.`);
    }
    return report;
  }

  async update(reportId: string, updateData: UpdateQuery<ReportDocument>) {
    const updatedReport = await this.reportModel
      .findByIdAndUpdate(reportId, updateData, { returnDocument: 'after' })
      .exec();
    if (!updatedReport) {
      throw new NotFoundException(
        `Report with ID '${reportId}' not found for update.`,
      );
    }
    return updatedReport;
  }

  async create(reportData: any) {
    return this.reportModel.create(reportData);
  }

  async deleteById(reportId: string) {
    const deletedReport = await this.reportModel
      .findByIdAndDelete(reportId)
      .exec();
    if (!deletedReport) {
      throw new NotFoundException(`Report not found for deletion.`);
    }
    return deletedReport;
  }

  async search(params: SearchReportParams, limit?: number) {
    const query = this.reportModel.find().sort({ _id: -1 });

    if (params.terms) {
      query.merge({
        $or: [
          { title: { $regex: params.terms, $options: 'i' } },
          { description: { $regex: params.terms, $options: 'i' } },
        ],
      });
    }

    if (params.status) {
      query.merge({ status: params.status });
    }

    if (params.cursor) {
      query.merge({ _id: { $lt: params.cursor } });
    }

    const pageSize = limit ?? this.DEFAULT_PAGE_SIZE;
    const data = await query.limit(pageSize).lean().exec();
    const nextCursor: string | null =
      data.length < pageSize ? null : String(data[data.length - 1]._id);

    const mappedData = data.map(report => ({
      ...report,
      id: String(report._id),
    }));

    return { data: mappedData, nextCursor };
  }

  async findByIds(reportIds: string[]) {
    return this.reportModel.find({ _id: { $in: reportIds } }).exec();
  }

  async findByPeriod(userId: string, month: number, year: number) {
    return this.reportModel.findOne({ userId, month, year }).exec();
  }
}