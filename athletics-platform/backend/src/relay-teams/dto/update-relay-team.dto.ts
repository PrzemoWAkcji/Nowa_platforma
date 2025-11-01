import { PartialType } from '@nestjs/mapped-types';
import { CreateRelayTeamDto } from './create-relay-team.dto';

export class UpdateRelayTeamDto extends PartialType(CreateRelayTeamDto) {}