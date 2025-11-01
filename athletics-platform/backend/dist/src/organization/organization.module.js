"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const schedule_controller_1 = require("./schedule/schedule.controller");
const schedule_service_1 = require("./schedule/schedule.service");
const schedule_generator_service_1 = require("./schedule/schedule-generator.service");
const heat_controller_1 = require("./heat/heat.controller");
const heat_service_1 = require("./heat/heat.service");
let OrganizationModule = class OrganizationModule {
};
exports.OrganizationModule = OrganizationModule;
exports.OrganizationModule = OrganizationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [schedule_controller_1.ScheduleController, heat_controller_1.HeatController],
        providers: [schedule_service_1.ScheduleService, schedule_generator_service_1.ScheduleGeneratorService, heat_service_1.HeatService],
        exports: [schedule_service_1.ScheduleService, schedule_generator_service_1.ScheduleGeneratorService, heat_service_1.HeatService],
    })
], OrganizationModule);
//# sourceMappingURL=organization.module.js.map