import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReportTemplate from './template/ReportTemplate';

@Injectable()
export class PdfService {
  async generatePdf(data: any): Promise<string> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = renderToStaticMarkup(
      React.createElement(ReportTemplate, {
        title: `Reporte mensual ${data.month}/${data.year}`,
        month: data.month,
        year: data.year,
        userId: data.userId,
        totalHours: data.totalHours,
        totalAmount: data.totalAmount,
        status: data.status,
      }),
    );

    await page.setContent(htmlContent);

    const pdfPath = `/tmp/report-${Date.now()}.pdf`;
    await page.pdf({ path: pdfPath, format: 'A4' });

    await browser.close();
    return pdfPath;
  }
}
