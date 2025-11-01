import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SecurityLoggerService } from './common/logger/security-logger.service';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { AuthModule } from './auth/auth.module';
import { AthletesModule } from './athletes/athletes.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { ResultsModule } from './results/results.module';
import { FinishlynxModule } from './finishlynx/finishlynx.module';
import { CombinedEventsModule } from './combined-events/combined-events.module';
import { EquipmentModule } from './equipment/equipment.module';
import { LiveResultsModule } from './live-results/live-results.module';
import { OrganizationModule } from './organization/organization.module';
import { UsersModule } from './users/users.module';
import { RecordsModule } from './records/records.module';
import { RelayTeamsModule } from './relay-teams/relay-teams.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: require('./common/config/env.validation').validate,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 100, // maximum number of items in cache
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CompetitionsModule,
    AthletesModule,
    EventsModule,
    RegistrationsModule,
    ResultsModule,
    FinishlynxModule,
    CombinedEventsModule,
    EquipmentModule,
    LiveResultsModule,
    OrganizationModule,
    UsersModule,
    RecordsModule,
    RelayTeamsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    SecurityLoggerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useFactory: (securityLogger: SecurityLoggerService) => 
        new AllExceptionsFilter(securityLogger),
      inject: [SecurityLoggerService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule {}
