"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinishlynxModule = void 0;
const common_1 = require("@nestjs/common");
const finishlynx_controller_1 = require("./finishlynx.controller");
const finishlynx_service_1 = require("./finishlynx.service");
const prisma_module_1 = require("../prisma/prisma.module");
const results_module_1 = require("../results/results.module");
const events_module_1 = require("../events/events.module");
const athletes_module_1 = require("../athletes/athletes.module");
let FinishlynxModule = class FinishlynxModule {
};
exports.FinishlynxModule = FinishlynxModule;
exports.FinishlynxModule = FinishlynxModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, results_module_1.ResultsModule, events_module_1.EventsModule, athletes_module_1.AthletesModule],
        controllers: [finishlynx_controller_1.FinishlynxController],
        providers: [finishlynx_service_1.FinishlynxService],
        exports: [finishlynx_service_1.FinishlynxService],
    })
], FinishlynxModule);
//# sourceMappingURL=finishlynx.module.js.map