import { Controller, Get, Query } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller('auth/slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('profile')
  async getProfileByEmail(@Query('email') email: string) {
    return this.slackService.getUserByEmail(email);
  }

  @Get('user/:userId/profile')
  async getProfile(@Query('userId') userId: string) {
    return this.slackService.getUserProfile(userId);
  }
}