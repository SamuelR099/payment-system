import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ReportRepository } from './repositories/report.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportRepository: ReportRepository) {}

  @Post('/')
  async createReport(@Body() createReportDto: CreateReportDto) {
    return this.reportRepository.create(createReportDto);
  }

  @Get('/:id')
  async getReport(@Param('id') id: string) {
    return this.reportRepository.findById(id, true);
  }

  @Put('/:id')
  async updateReport(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportRepository.update(id, updateReportDto);
  }
}
