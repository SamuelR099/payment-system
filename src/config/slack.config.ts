import { registerAs } from '@nestjs/config';

export default registerAs('slack', () => ({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  redirectUri: process.env.SLACK_REDIRECT_URI,
  userToken: process.env.SLACK_USER_TOKEN,
}));
