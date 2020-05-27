import { JwtDto } from './dto/jwt.dto';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/models';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET')
    });
  }

  async validate(payload: JwtDto): Promise<User> {
    const user = await this.userService.findUser({
      where: { id: payload.userId },
      include: {
        account: true,
        userRoles: true,
        organization: true
      }
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
