"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRelayTeamDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_relay_team_dto_1 = require("./create-relay-team.dto");
class UpdateRelayTeamDto extends (0, mapped_types_1.PartialType)(create_relay_team_dto_1.CreateRelayTeamDto) {
}
exports.UpdateRelayTeamDto = UpdateRelayTeamDto;
//# sourceMappingURL=update-relay-team.dto.js.map