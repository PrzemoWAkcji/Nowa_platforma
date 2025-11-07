import { Controller, Get } from '@nestjs/common';

@Controller('debug')
export class DebugController {
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
}
