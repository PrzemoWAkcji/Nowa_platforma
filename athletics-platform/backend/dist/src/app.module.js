"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const core_1 = require("@nestjs/core");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const security_logger_service_1 = require("./common/logger/security-logger.service");
const performance_interceptor_1 = require("./common/interceptors/performance.interceptor");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const competitions_module_1 = require("./competitions/competitions.module");
const auth_module_1 = require("./auth/auth.module");
const athletes_module_1 = require("./athletes/athletes.module");
const events_module_1 = require("./events/events.module");
const registrations_module_1 = require("./registrations/registrations.module");
const results_module_1 = require("./results/results.module");
const finishlynx_module_1 = require("./finishlynx/finishlynx.module");
const combined_events_module_1 = require("./combined-events/combined-events.module");
const equipment_module_1 = require("./equipment/equipment.module");
const live_results_module_1 = require("./live-results/live-results.module");
const organization_module_1 = require("./organization/organization.module");
const users_module_1 = require("./users/users.module");
const records_module_1 = require("./records/records.module");
const relay_teams_module_1 = require("./relay-teams/relay-teams.module");
const health_controller_1 = require("./health/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: require('./common/config/env.validation').validate,
            }),
            throttler_1.ThrottlerModule.forRoot([
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
            cache_manager_1.CacheModule.register({
                ttl: 300,
                max: 100,
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            competitions_module_1.CompetitionsModule,
            athletes_module_1.AthletesModule,
            events_module_1.EventsModule,
            registrations_module_1.RegistrationsModule,
            results_module_1.ResultsModule,
            finishlynx_module_1.FinishlynxModule,
            combined_events_module_1.CombinedEventsModule,
            equipment_module_1.EquipmentModule,
            live_results_module_1.LiveResultsModule,
            organization_module_1.OrganizationModule,
            users_module_1.UsersModule,
            records_module_1.RecordsModule,
            relay_teams_module_1.RelayTeamsModule,
        ],
        controllers: [app_controller_1.AppController, health_controller_1.HealthController],
        providers: [
            app_service_1.AppService,
            security_logger_service_1.SecurityLoggerService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useFactory: (securityLogger) => new all_exceptions_filter_1.AllExceptionsFilter(securityLogger),
                inject: [security_logger_service_1.SecurityLoggerService],
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: performance_interceptor_1.PerformanceInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map