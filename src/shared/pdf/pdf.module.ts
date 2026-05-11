import { Module, forwardRef } from '@nestjs/common';

import { FileManagementModule } from 'src/file-management/file-management.module';
import { IdentityModule } from 'src/identity/infrastructure/identity.module';
import { ReportsModule } from 'src/reports/infrastructure/reports.module';

import { PdfService } from './pdf.service';

@Module({
  imports: [
    FileManagementModule,
    IdentityModule,
    forwardRef(() => ReportsModule),
  ],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
