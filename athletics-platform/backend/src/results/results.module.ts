import { Module } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AthletesModule } from '../athletes/athletes.module';
import { RecordsModule } from '../records/records.module';

@Module({
  imports: [PrismaModule, AthletesModule, RecordsModule],
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService],
})
export class ResultsModule {}
