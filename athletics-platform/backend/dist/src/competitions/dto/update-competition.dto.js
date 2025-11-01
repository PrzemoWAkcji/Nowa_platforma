"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCompetitionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_competition_dto_1 = require("./create-competition.dto");
class UpdateCompetitionDto extends (0, mapped_types_1.PartialType)(create_competition_dto_1.CreateCompetitionDto) {
}
exports.UpdateCompetitionDto = UpdateCompetitionDto;
//# sourceMappingURL=update-competition.dto.js.map