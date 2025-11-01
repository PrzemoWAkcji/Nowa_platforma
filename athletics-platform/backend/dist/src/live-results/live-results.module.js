"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveResultsModule = void 0;
const common_1 = require("@nestjs/common");
const live_results_service_1 = require("./live-results.service");
const live_results_controller_1 = require("./live-results.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let LiveResultsModule = class LiveResultsModule {
};
exports.LiveResultsModule = LiveResultsModule;
exports.LiveResultsModule = LiveResultsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [live_results_controller_1.LiveResultsController],
        providers: [live_results_service_1.LiveResultsService],
        exports: [live_results_service_1.LiveResultsService],
    })
], LiveResultsModule);
//# sourceMappingURL=live-results.module.js.map