import { Injectable, forwardRef, Inject } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

import { AwsS3Service } from 'src/file-management/infrastructure/aws-s3.service';
import { ReportRepository } from 'src/reports/infrastructure/repositories/report.repository';
import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';
import { ReportDocument } from 'src/reports/infrastructure/schemas/report.schema';
import { TimesheetDocument } from 'src/timesheets/infrastructure/schemas/timesheet.schema';
import { ReportPeriod } from 'src/reports/domain/value-objects/report-period';

import ReportTemplate from './template/ReportTemplate';
import { renderPdfTemplate } from './utils/render-pdf-template.util';

@Injectable()
export class PdfService {
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => ReportRepository))
    private readonly reportRepository: ReportRepository,
  ) {}

  async generateAndUploadReport(
    report: ReportDocument,
    timesheetDocuments: TimesheetDocument[],
    period: ReportPeriod,
  ) {
    const user = await this.userRepository.findById(report.userId, true);
    const professionalName = `${user.profile.firstName} ${user.profile.lastName}`;

    const timesheetWithSignature = timesheetDocuments.find(
      ts => ts.signed && ts.signatureImageUrl,
    );
    const signatureUrl =
      report.employeeSignatureImage ||
      timesheetWithSignature?.signatureImageUrl ||
      user.profile.avatarUrl;

    const signatureDate = report.employeeSignedAt
      ? report.employeeSignedAt
      : timesheetWithSignature?.signedAt;

    const pdfData = {
      logoUrl: undefined,
      professionalName,
      position: user.profile.position,
      monthYear: period.getLabel(),
      timesheets: timesheetDocuments.map(ts => {
        const start = 8;
        const endBeforeLunch = start + ts.hours;
        const crossesLunch = endBeforeLunch > 12;
        const end = crossesLunch ? endBeforeLunch + 1 : endBeforeLunch;
        const hours = ts.hours;

        const ampm = end >= 12 ? 'p. m.' : 'a. m.';
        const displayEnd = end > 12 ? end - 12 : end;

        return {
          date: new Date(ts.date).toLocaleDateString('es-PR'),
          description: ts.description,
          startTime: '8:00:00 a. m.',
          endTime: `${displayEnd}:00:00 ${ampm}`,
          hours,
        };
      }),
      totalHours: report.totalHours,
      hourlyRate: report.hourlyRate,
      totalAmount: report.totalAmount,
      professionalSignatureUrl: await this.getBase64Image(signatureUrl),
      supervisorName: 'Raúl D. Olivero Carrucini',
      supervisorSignatureUrl: await this.getBase64Image(
        report.adminSignatureImage,
      ),
      signatureDate: (signatureDate || new Date()).toLocaleDateString('es-PR'),
      supervisorSignatureDate: report.adminSignedAt
        ? report.adminSignedAt.toLocaleDateString('es-PR')
        : '',
    };

    const htmlContent = renderPdfTemplate(ReportTemplate, pdfData);

    try {
      const pdfBuffer = await this.generatePdfFromHtml(htmlContent);
      const s3FileName = `reports/${report._id}-${report.month}-${report.year}.pdf`;

      const publicUrl = await this.awsS3Service.uploadBuffer(
        s3FileName,
        pdfBuffer,
        'application/pdf',
        'private',
      );

      await this.reportRepository.update(report._id.toString(), {
        pdfPath: s3FileName,
      });

      return publicUrl;
    } catch (error) {
      console.error('Error generating or uploading PDF:', error);
      throw error;
    }
  }

  private async getBase64Image(url?: string): Promise<string | undefined> {
    if (!url) return undefined;
    try {
      let fetchUrl = url;
      if (url.includes('amazonaws.com')) {
        fetchUrl = await this.awsS3Service.getSignedUrl(url);
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/png';

      if (contentType.includes('xml')) {
        throw new Error(
          'Received XML instead of an image. Likely an S3 access error.',
        );
      }

      return `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (e) {
      console.error('Error fetching image for PDF:', e);
      return undefined;
    }
  }

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      protocolTimeout: 120_000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-translate',
        '--no-first-run',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate:
          '<div style="font-size: 10px; text-align: right; width: 100%; padding-right: 40px;"><span class="pageNumber"></span></div>',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '40px',
          left: '20px',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
