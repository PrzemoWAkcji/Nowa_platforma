"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AthletesModule = void 0;
const common_1 = require("@nestjs/common");
const athletes_service_1 = require("./athletes.service");
const athletes_controller_1 = require("./athletes.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let AthletesModule = class AthletesModule {
};
exports.AthletesModule = AthletesModule;
exports.AthletesModule = AthletesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [athletes_controller_1.AthletesController],
        providers: [athletes_service_1.AthletesService],
        exports: [athletes_service_1.AthletesService],
    })
], AthletesModule);
//# sourceMappingURL=athletes.module.js.map