import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { ScheduleModule } from '@nestjs/schedule';

import apiConfig from './config/api.config';
import corsConfig from './config/cors.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import paymentConfig from './config/payment.config';
import recaptchaConfig from './config/recaptcha.config';
import slackConfig from './config/slack.config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientRouteBuilder } from './shared/utils';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { MailModule } from './shared/mail';
import { SlackModule } from './identity/infrastructure/slack/slack.module';
import { IdentityModule } from './identity/infrastructure/identity.module';
import { TimesheetsModule } from './timesheets/infrastructure/timesheets.module';
import { ProjectsModule } from './projects/infrastructure/projects.module';
import { ReportsModule } from './reports/infrastructure/reports.module';
import { BlockchainModule } from './crypto/blockchain/blockchain.module';
import { UserWalletModule } from './crypto/user-wallet/user-wallet.module';
import { PaymentsModule } from './crypto/payments/payments.module';
import { DashboardModule } from './dashboard/infrastructure/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        apiConfig,
        corsConfig,
        databaseConfig,
        jwtConfig,
        mailConfig,
        paymentConfig,
        recaptchaConfig,
        slackConfig,
      ],
    }),
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('recaptcha'),
    }),
    ScheduleModule.forRoot(),
    IdentityModule,
    TimesheetsModule,
    ProjectsModule,
    ReportsModule,
    DashboardModule,
    BlockchainModule,
    UserWalletModule,
    PaymentsModule,
    MailModule.forRootAsync({
      imports: [ConfigModule, HttpModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('mail'),
    }),
    SlackModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database.mongo'),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    {
      provide: ClientRouteBuilder,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => new ClientRouteBuilder(config),
    },
  ],
})
export class AppModule {}
