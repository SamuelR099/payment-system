import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';

import { Report, ReportDocument } from '../schemas/report.schema';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

export type SearchReportParams = {
  status?: string;
  cursor?: string;
  userId?: string;
  supervisorId?: string;
  month?: number;
  year?: number;
};

@Injectable()
export class ReportRepository {
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

  async search(params: SearchReportParams) {
    const query = this.reportModel.find().sort({ _id: -1 });

    this.applyFilters(query, params);

    const reports = await query.limit(DEFAULT_PAGE_SIZE + 1).exec();

    let nextCursor: string | null = null;
    if (reports.length > DEFAULT_PAGE_SIZE) {
      reports.pop();
      const lastItem = reports[reports.length - 1];
      nextCursor = lastItem.id;
    }

    const data = reports.map(report => {
      const reportObj = report.toObject();
      return { ...reportObj, id: report.id };
    });

    return { data, nextCursor };
  }

  async count(params: SearchReportParams) {
    const query = this.reportModel.countDocuments();
    this.applyFilters(query, params);
    return query.exec();
  }

  async findLatest(params: SearchReportParams, limit: number) {
    const query = this.reportModel.find().sort({ _id: -1 });
    this.applyFilters(query, params);
    const reports = await query.limit(limit).exec();

    return reports.map(report => {
      const reportObj = report.toObject();
      return { ...reportObj, id: report.id };
    });
  }

  async findByIds(reportIds: string[]) {
    return this.reportModel.find({ _id: { $in: reportIds } }).exec();
  }

  async findByPeriod(userId: string, month: number, year: number) {
    return this.reportModel.findOne({ userId, month, year }).exec();
  }

  private applyFilters(query: any, params: SearchReportParams) {
    if (params.status) {
      query.merge({ status: params.status });
    }

    if (params.userId) {
      query.merge({
        $or: [
          { userId: params.userId },
          { userId: new Types.ObjectId(params.userId) },
        ],
      });
    }

    if (params.supervisorId) {
      query.merge({ supervisorId: params.supervisorId });
    }

    if (params.month) {
      query.merge({ month: params.month });
    }

    if (params.year) {
      query.merge({ year: params.year });
    }

    if (params.cursor && Types.ObjectId.isValid(params.cursor)) {
      query.merge({ _id: { $lt: new Types.ObjectId(params.cursor) } });
    }
  }
}
