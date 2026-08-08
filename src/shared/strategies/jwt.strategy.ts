import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { UserRepository } from 'src/identity/infrastructure/repositories/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userRepository: UserRepository,
    protected readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    this.validateExpiration(payload.exp);

    const user = await this.userRepository.findById(payload.userId, true, {
      role: true,
    });
    return { userId: payload.userId, id: payload.userId, role: user.role };
  }

  private validateExpiration(expirationDate: number) {
    if (Date.now() >= expirationDate * 1000) {
      throw new UnauthorizedException('SESSION_TOKEN_EXPIRED');
    }
  }
}
