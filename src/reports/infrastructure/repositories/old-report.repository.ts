import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { OldReport, OldReportDocument } from '../schemas/old-report.schema';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

export type SearchOldReportParams = {
  uploadedBy?: string;
  cursor?: string;
  limit?: number;
};

@Injectable()
export class OldReportRepository {
  constructor(
    @InjectModel(OldReport.name)
    private readonly oldReportModel: Model<OldReportDocument>,
  ) {}

  async search(params: SearchOldReportParams) {
    const pageSize = params.limit ?? DEFAULT_PAGE_SIZE;
    const filter = this.buildFilter(params);
    const data = await this.oldReportModel
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

  async findById(id: string, failIfNotFound = false) {
    const report = await this.oldReportModel.findById(id).lean().exec();
    if (!report && failIfNotFound) {
      throw new NotFoundException(
        `Reporte antiguo con ID '${id}' no encontrado.`,
      );
    }
    return report;
  }

  async findByPeriod(referenceMonth: number, referenceYear: number) {
    return this.oldReportModel
      .findOne({ referenceMonth, referenceYear })
      .lean()
      .exec();
  }

  async create(data: {
    pdfFileName: string;
    referenceMonth: number;
    referenceYear: number;
    pdfPath: string;
    uploadedBy: string;
  }) {
    return this.oldReportModel.create(data);
  }

  async deleteById(id: string) {
    const deleted = await this.oldReportModel
      .findByIdAndDelete(id)
      .lean()
      .exec();
    if (!deleted) {
      throw new NotFoundException(
        `Reporte antiguo no encontrado para eliminación.`,
      );
    }
    return deleted;
  }

  private buildFilter(params: SearchOldReportParams) {
    const filter: any = { $and: [] };

    if (params.uploadedBy) {
      filter.$and.push({ uploadedBy: params.uploadedBy });
    }

    if (params.cursor) {
      filter.$and.push({ _id: { $lt: new Types.ObjectId(params.cursor) } });
    }

    if (filter.$and.length === 0) {
      delete filter.$and;
    }

    return filter;
  }
}
