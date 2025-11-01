import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleController } from './schedule/schedule.controller';
import { ScheduleService } from './schedule/schedule.service';
import { ScheduleGeneratorService } from './schedule/schedule-generator.service';
import { HeatController } from './heat/heat.controller';
import { HeatService } from './heat/heat.service';

@Module({
  imports: [PrismaModule],
  controllers: [ScheduleController, HeatController],
  providers: [ScheduleService, ScheduleGeneratorService, HeatService],
  exports: [ScheduleService, ScheduleGeneratorService, HeatService],
})
export class OrganizationModule {}
