import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Cache } from 'cache-manager';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly config: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const cacheKey: string = `user${payload.sub}`;
    let user: User | null = await this.cacheManager.get(cacheKey);
    if (user) {
      return user;
    } else {
      user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (user) {
        delete user.hash;
        await this.cacheManager.set(cacheKey, user, 1 * 60 * 1000);
      }

      return user;
    }
  }
}
