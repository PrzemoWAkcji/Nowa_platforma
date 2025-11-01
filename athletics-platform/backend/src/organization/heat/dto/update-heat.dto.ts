import { PartialType } from '@nestjs/mapped-types';
import { CreateHeatDto } from './create-heat.dto';

export class UpdateHeatDto extends PartialType(CreateHeatDto) {}
