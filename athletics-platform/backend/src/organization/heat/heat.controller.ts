import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HeatService } from './heat.service';
import { CreateHeatDto } from './dto/create-heat.dto';
import { UpdateHeatDto } from './dto/update-heat.dto';
import { AutoAssignDto, AdvancedAutoAssignDto } from './dto/auto-assign.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('organization/heats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HeatController {
  constructor(private readonly heatService: HeatService) {}

  @Post()
  @Roles('ADMIN', 'COACH', 'JUDGE')
  create(@Body() createHeatDto: CreateHeatDto) {
    return this.heatService.create(createHeatDto);
  }

  @Get()
  findAll(@Query('eventId') eventId?: string, @Query('round') round?: string) {
    return this.heatService.findAll(eventId, round);
  }

  @Get('event/:eventId')
  getEventHeats(@Param('eventId') eventId: string) {
    return this.heatService.getEventHeats(eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.heatService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'COACH', 'JUDGE')
  update(@Param('id') id: string, @Body() updateHeatDto: UpdateHeatDto) {
    return this.heatService.update(id, updateHeatDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'COACH')
  remove(@Param('id') id: string) {
    return this.heatService.remove(id);
  }

  @Post('auto-assign')
  @Roles('ADMIN', 'COACH', 'JUDGE')
  autoAssign(@Body() autoAssignDto: AutoAssignDto) {
    return this.heatService.autoAssign(autoAssignDto);
  }

  @Post('advanced-auto-assign')
  @Roles('ADMIN', 'COACH', 'JUDGE')
  advancedAutoAssign(@Body() advancedAutoAssignDto: AdvancedAutoAssignDto) {
    return this.heatService.advancedAutoAssign(advancedAutoAssignDto);
  }
}
