import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { OldReport, OldReportDocument } from '../schemas/old-report.schema';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

export type SearchOldReportParams = {
  uploadedBy?: string;
  cursor?: string;
};

@Injectable()
export class OldReportRepository {
  constructor(
    @InjectModel(OldReport.name)
    private readonly oldReportModel: Model<OldReportDocument>,
  ) {}

  async search(params: SearchOldReportParams) {
    const query = this.oldReportModel.find().sort({ _id: -1 });

    if (params.uploadedBy) {
      query.merge({ uploadedBy: params.uploadedBy });
    }

    if (params.cursor && Types.ObjectId.isValid(params.cursor)) {
      query.merge({ _id: { $lt: new Types.ObjectId(params.cursor) } });
    }

    const reports = await query.limit(DEFAULT_PAGE_SIZE + 1).lean().exec();

    let nextCursor: string | null = null;
    if (reports.length > DEFAULT_PAGE_SIZE) {
      reports.pop();
      const lastItem = reports[reports.length - 1];
      nextCursor = String(lastItem._id);
    }

    return { data: reports, nextCursor };
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
}
