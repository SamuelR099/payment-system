import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';

@Injectable()
export class SlackService {
  private readonly client: WebClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new WebClient(this.configService.get('slack.userToken'));
  }

  async getUserProfile(userId: string) {
    const result = await this.client.users.profile.get({ user: userId });

    if (!result.ok || !result.profile) {
      return null;
    }

    return {
      name: result.profile.display_name || result.profile.real_name,
      email: result.profile.email,
      avatarUrl: result.profile.image_192 || result.profile.image_72,
    };
  }

  async getUserByEmail(email: string) {
    const result = await this.client.users.lookupByEmail({ email });

    if (!result.ok || !result.user) {
      return null;
    }

    return {
      slackUserId: result.user.id,
      name: result.user.profile?.display_name || result.user.profile?.real_name,
      email: result.user.profile?.email,
      avatarUrl:
        result.user.profile?.image_192 || result.user.profile?.image_72,
    };
  }
}
