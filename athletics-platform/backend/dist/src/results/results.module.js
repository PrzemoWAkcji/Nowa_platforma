"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultsModule = void 0;
const common_1 = require("@nestjs/common");
const results_service_1 = require("./results.service");
const results_controller_1 = require("./results.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const athletes_module_1 = require("../athletes/athletes.module");
const records_module_1 = require("../records/records.module");
let ResultsModule = class ResultsModule {
};
exports.ResultsModule = ResultsModule;
exports.ResultsModule = ResultsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, athletes_module_1.AthletesModule, records_module_1.RecordsModule],
        controllers: [results_controller_1.ResultsController],
        providers: [results_service_1.ResultsService],
        exports: [results_service_1.ResultsService],
    })
], ResultsModule);
//# sourceMappingURL=results.module.js.map