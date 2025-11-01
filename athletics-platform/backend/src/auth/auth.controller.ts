import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  async register(
    @Body() registerDto: RegisterDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.register(registerDto);

    // Set HttpOnly cookie with JWT token
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('auth-token', result.token, {
      httpOnly: true,
      secure: isProduction, // Secure only in production
      sameSite: isProduction ? 'strict' : 'lax', // Strict in production, lax in development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: undefined, // Don't set domain
    });

    // Return user data without token
    return {
      user: result.user,
      message: result.message,
    };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async login(
    @Body() loginDto: LoginDto,
    @Request() req: ExpressRequest,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    console.log('🔐 Login request received:', {
      email: loginDto.email,
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent'),
      cookies: req.cookies,
    });

    const ip =
      req.ip ||
      req.connection?.remoteAddress ||
      (req.socket as any)?.remoteAddress;
    const userAgent = req.get('User-Agent');

    const result = await this.authService.login(loginDto, ip, userAgent);

    console.log(
      '✅ Login successful, setting cookie for user:',
      result.user.email,
    );

    // Set HttpOnly cookie with JWT token
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('auth-token', result.token, {
      httpOnly: true,
      secure: isProduction, // Secure only in production
      sameSite: isProduction ? 'strict' : 'lax', // Strict in production, lax in development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: undefined, // Don't set domain
    });

    // Return user data with token
    return {
      user: result.user,
      token: result.token,
      message: result.message,
    };
  }

  @Post('logout')
  logout(@Response({ passthrough: true }) res: ExpressResponse) {
    // Clear the auth cookie
    res.clearCookie('auth-token');
    return { message: 'Wylogowano pomyślnie' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: { sub: string } }) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(
    @Request() req: { user: { sub: string; email: string; role: string } },
  ) {
    return this.authService.getProfile(req.user.sub);
  }
}
