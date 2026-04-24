import { UpdateReportDto } from '../../infrastructure/dto/update-report.dto';

export class UpdateReportCommand {
  constructor(
    public readonly id: string,
    public readonly updateReportDto: UpdateReportDto,
  ) {}
}
