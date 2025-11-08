import { Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Controller('debug')
export class DebugController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getDebugInfo() {
    return {
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'SET ✅' : 'NOT SET ❌',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET ✅' : 'NOT SET ❌',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET ❌',
        PORT: process.env.PORT || 'NOT SET ❌',
        FRONTEND_URL: process.env.FRONTEND_URL || 'NOT SET ❌',
      },
      timestamp: new Date().toISOString(),
      message: 'Check Railway Variables if any are NOT SET',
    };
  }

  @Post('create-admin')
  async createAdmin() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const existing = await this.prisma.user.findUnique({
      where: { email: 'admin@athletics.pl' },
    });

    if (existing) {
      return { message: 'Admin already exists', email: 'admin@athletics.pl' };
    }

    const admin = await this.prisma.user.create({
      data: {
        email: 'admin@athletics.pl',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+48123456789',
        role: UserRole.ADMIN,
        password: hashedPassword,
        isActive: true,
      },
    });

    return { 
      message: 'Admin created successfully', 
      email: admin.email,
      password: 'password123' 
    };
  }
}
