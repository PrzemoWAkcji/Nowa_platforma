import { Module } from '@nestjs/common';
import { FinishlynxController } from './finishlynx.controller';
import { FinishlynxService } from './finishlynx.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ResultsModule } from '../results/results.module';
import { EventsModule } from '../events/events.module';
import { AthletesModule } from '../athletes/athletes.module';

@Module({
  imports: [PrismaModule, ResultsModule, EventsModule, AthletesModule],
  controllers: [FinishlynxController],
  providers: [FinishlynxService],
  exports: [FinishlynxService],
})
export class FinishlynxModule {}
