"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCombinedEventResultDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateCombinedEventResultDto {
    performance;
    wind;
}
exports.UpdateCombinedEventResultDto = UpdateCombinedEventResultDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^(\d+\.?\d*|\d{1,2}:\d{1,2}\.?\d*)$/, {
        message: 'Performance must be in format: "10.50" for time/distance or "1:15.30" for longer times',
    }),
    __metadata("design:type", String)
], UpdateCombinedEventResultDto.prototype, "performance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[+-]?\d+\.?\d*$/, {
        message: 'Wind must be a number (e.g., "+1.5", "-0.8")',
    }),
    __metadata("design:type", String)
], UpdateCombinedEventResultDto.prototype, "wind", void 0);
//# sourceMappingURL=update-combined-event-result.dto.js.map