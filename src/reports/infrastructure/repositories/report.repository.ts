import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { ReportDocument, Report } from '../schemas/report.schema';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';

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

  async update(reportId: string, updateData: UpdateReportDto) {
    const updatedReport = await this.reportModel
      .findByIdAndUpdate(reportId, updateData, { new: true })
      .exec();
    if (!updatedReport) {
      throw new NotFoundException(`Report with ID '${reportId}' not found for update.`);
    }
    return updatedReport;
  }

  async create(reportData: CreateReportDto) {
    const report = new this.reportModel(reportData);
    return report.save();
  }

  async search(filters: FilterQuery<ReportDocument>, page = 1) {
    const skip = (page - 1) * this.DEFAULT_PAGE_SIZE;
    const query = this.reportModel.find(filters);

    query.skip(skip).limit(this.DEFAULT_PAGE_SIZE);

    const data = await query.exec();
    const nextPage = data.length === this.DEFAULT_PAGE_SIZE ? page + 1 : null;

    return { data, nextPage };
  }

  async findByIds(reportIds: string[]) {
    const query = this.reportModel.find({ _id: { $in: reportIds } });
    return query.exec();
  }
}
