import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/entities/user.entity';
import {
  JwtPayload,
  RequestUser,
  UserStatus,
} from '../../common/interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return (request.cookies as Record<string, unknown>)
            ?.accessToken as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.userModel.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (
      user.status === UserStatus.INACTIVE ||
      user.status === UserStatus.SUSPENDED
    ) {
      throw new UnauthorizedException('Account is inactive');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      permissions: payload.permissions,
    };
  }
}
