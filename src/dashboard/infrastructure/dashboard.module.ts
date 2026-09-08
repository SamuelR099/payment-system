import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PaymentsModule } from 'src/crypto/payments/payments.module';
import { IdentityModule } from 'src/identity/infrastructure/identity.module';
import { ReportsModule } from 'src/reports/infrastructure/reports.module';
import { TimesheetsModule } from 'src/timesheets/infrastructure/timesheets.module';

import { GetDashboardSummaryHandler } from '../application/get-dashboard-summary/get-dashboard-summary.handler';
import { DashboardSummaryService } from '../domain/dashboard-summary.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    CqrsModule,
    IdentityModule,
    TimesheetsModule,
    ReportsModule,
    PaymentsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardSummaryService, GetDashboardSummaryHandler],
})
export class DashboardModule {}
