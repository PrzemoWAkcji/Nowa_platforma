"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAthleteDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_athlete_dto_1 = require("./create-athlete.dto");
class UpdateAthleteDto extends (0, mapped_types_1.PartialType)(create_athlete_dto_1.CreateAthleteDto) {
}
exports.UpdateAthleteDto = UpdateAthleteDto;
//# sourceMappingURL=update-athlete.dto.js.map