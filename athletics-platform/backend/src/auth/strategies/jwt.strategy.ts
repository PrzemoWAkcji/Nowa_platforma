import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // First try to extract from cookie
        (request: Request) => {
          return request?.cookies?.['auth-token'] as string | null;
        },
        // Fallback to Authorization header for API compatibility
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: (() => {
        const secret = process.env.JWT_SECRET;
        if (!secret && process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET must be set in production environment');
        }
        return (
          secret ||
          'athletics-platform-super-secure-secret-key-change-in-production-2024'
        );
      })(),
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<{
    sub: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Użytkownik nie został znaleziony lub jest nieaktywny',
      );
    }

    return {
      sub: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
    };
  }
}
