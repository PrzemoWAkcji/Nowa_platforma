import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service';
import { SecurityLoggerService } from './security-logger.service';

@Global()
@Module({
  providers: [AppLoggerService, SecurityLoggerService],
  exports: [AppLoggerService, SecurityLoggerService],
})
export class LoggerModule {}
