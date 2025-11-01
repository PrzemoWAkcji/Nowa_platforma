import { Module } from '@nestjs/common';
import { CombinedEventsController } from './combined-events.controller';
import { CombinedEventsService } from './combined-events.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CombinedEventsController],
  providers: [CombinedEventsService],
  exports: [CombinedEventsService],
})
export class CombinedEventsModule {}
