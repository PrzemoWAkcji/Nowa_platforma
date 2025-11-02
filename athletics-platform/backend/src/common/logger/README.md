# 📝 Logging System Documentation

## Overview

The application uses Winston for structured logging with:

- **AppLoggerService** - General application logging
- **SecurityLoggerService** - Security-specific events

## Features

✅ File rotation (5MB max, 5 files per log type)
✅ Separate log files (error.log, warn.log, combined.log)
✅ Colorized console output in development
✅ JSON format for easy parsing
✅ Context support
✅ HTTP request logging
✅ Database query logging

## Log Files

All logs are stored in `/logs` directory (auto-created):

- `error.log` - Error level messages only
- `warn.log` - Warning level messages only
- `combined.log` - All messages
- `security-error.log` - Security errors
- `security-combined.log` - All security events

## Usage

### Basic Logging

```typescript
import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../common/logger/app-logger.service';

@Injectable()
export class MyService {
  constructor(private readonly logger: AppLoggerService) {
    // Set context for this service
    this.logger.setContext('MyService');
  }

  async doSomething() {
    this.logger.log('Starting operation');

    try {
      // Your code here
      this.logger.log('Operation completed successfully');
    } catch (error) {
      this.logger.error('Operation failed', error.stack);
    }
  }
}
```

### HTTP Request Logging

```typescript
this.logger.logRequest('GET', '/api/competitions', 200, 45, userId);
// Logs: HTTP Request GET /api/competitions - 200 - 45ms - user: xyz
```

### Database Query Logging

```typescript
const startTime = Date.now();
const result = await this.prisma.competition.findMany();
const duration = Date.now() - startTime;

this.logger.logQuery('SELECT * FROM competitions', duration);
```

### Custom Metadata

```typescript
this.logger.logWithMeta('info', 'User registered', {
  userId: '123',
  email: 'user@example.com',
  ipAddress: '192.168.1.1',
});
```

### Different Log Levels

```typescript
this.logger.debug('Debug information');
this.logger.log('Info message');
this.logger.warn('Warning message');
this.logger.error('Error message', stackTrace);
this.logger.verbose('Verbose message');
```

### Security Logging

```typescript
import { SecurityLoggerService } from '../common/logger/security-logger.service';

@Injectable()
export class AuthService {
  constructor(private readonly securityLogger: SecurityLoggerService) {}

  async login(email: string, password: string, ip: string) {
    try {
      // Login logic
      this.securityLogger.logSuccessfulLogin(user.id, email, ip);
    } catch (error) {
      this.securityLogger.logFailedLogin(email, ip);
    }
  }
}
```

## Configuration

### Log Level

Set via environment variable:

```bash
LOG_LEVEL=debug  # debug, info, warn, error
```

### File Rotation

Edit in `app-logger.service.ts`:

```typescript
maxsize: 5242880, // 5MB
maxFiles: 5,      // Keep 5 rotated files
```

## Production Best Practices

1. **Set appropriate log level**

   ```bash
   LOG_LEVEL=warn  # Only warnings and errors in production
   ```

2. **Monitor log files**
   - Set up log rotation with logrotate
   - Monitor disk space
   - Set up alerts for errors

3. **Centralized logging** (optional)
   - Ship logs to ELK stack
   - Use CloudWatch Logs
   - Use Datadog/New Relic

4. **Never log sensitive data**

   ```typescript
   // ❌ Bad
   this.logger.log(`User password: ${password}`);

   // ✅ Good
   this.logger.log('User authentication successful', { userId });
   ```

## Querying Logs

### View recent errors

```bash
tail -f logs/error.log
```

### Search for specific events

```bash
grep "FAILED_LOGIN" logs/security-combined.log
```

### Parse JSON logs

```bash
cat logs/combined.log | jq '.message'
```

## Integration with NestJS Built-in Logger

Replace NestJS default logger in `main.ts`:

```typescript
import { AppLoggerService } from './common/logger/app-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new AppLoggerService('Bootstrap'),
  });

  // ...
}
```

## Monitoring

### Check log files size

```bash
du -sh logs/*
```

### Count errors in last hour

```bash
grep "\"level\":\"error\"" logs/error.log | grep "$(date +%Y-%m-%d\ %H)" | wc -l
```

## Troubleshooting

### Logs directory not created

- Ensure write permissions
- Check if fs.mkdirSync is working
- Manually create: `mkdir logs`

### Logs not appearing

- Check LOG_LEVEL environment variable
- Verify logger is injected correctly
- Check file permissions

### Log files too large

- Reduce maxsize
- Decrease maxFiles
- Implement external log shipping
