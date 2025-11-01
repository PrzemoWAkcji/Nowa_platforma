"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateHeatDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_heat_dto_1 = require("./create-heat.dto");
class UpdateHeatDto extends (0, mapped_types_1.PartialType)(create_heat_dto_1.CreateHeatDto) {
}
exports.UpdateHeatDto = UpdateHeatDto;
//# sourceMappingURL=update-heat.dto.js.map