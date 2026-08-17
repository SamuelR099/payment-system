import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OldReport, OldReportDocument } from '../schemas/old-report.schema';

@Injectable()
export class OldReportRepository {
  constructor(
    @InjectModel(OldReport.name)
    private readonly oldReportModel: Model<OldReportDocument>,
  ) {}

  async findAll() {
    return this.oldReportModel.find().sort({ createdAt: -1 }).lean().exec();
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
