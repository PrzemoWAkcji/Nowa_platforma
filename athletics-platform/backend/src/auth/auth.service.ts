import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SecurityLoggerService } from '../common/logger/security-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private securityLogger: SecurityLoggerService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone, role } = registerDto;

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Użytkownik z tym adresem email już istnieje',
      );
    }

    // Hashuj hasło
    const hashedPassword = await bcrypt.hash(password, 12);

    // Utwórz użytkownika
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Wygeneruj token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
      message: 'Rejestracja przebiegła pomyślnie',
    };
  }

  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const { email, password } = loginDto;
    this.logger.debug(`Login attempt for email: ${email}`);

    // Znajdź użytkownika
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`Failed login attempt for non-existent user: ${email}`);
      this.securityLogger.logFailedLogin(email, ip || 'unknown', userAgent);
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // Sprawdź czy konto jest aktywne
    if (!user.isActive) {
      this.logger.warn(`Failed login attempt for inactive user: ${email}`);
      this.securityLogger.logFailedLogin(email, ip || 'unknown', userAgent);
      throw new UnauthorizedException('Konto zostało dezaktywowane');
    }

    // Sprawdź hasło
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(
        `Failed login attempt - invalid password for user: ${email}`,
      );
      this.securityLogger.logFailedLogin(email, ip || 'unknown', userAgent);
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // Zaktualizuj ostatnie logowanie
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log successful login
    this.securityLogger.logSuccessfulLogin(
      user.id,
      user.email,
      ip || 'unknown',
      userAgent,
    );

    this.logger.log(`Successful login for user: ${email}`);

    // Wygeneruj token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
      message: 'Logowanie przebiegło pomyślnie',
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Użytkownik nie został znaleziony lub jest nieaktywny',
      );
    }

    return user;
  }

  async getProfile(userId: string) {
    return this.validateUser(userId);
  }
}
