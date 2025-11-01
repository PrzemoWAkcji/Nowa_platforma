import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { StartListImportService } from './startlist-import.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FinishlynxService } from '../finishlynx/finishlynx.service';

@Module({
  imports: [PrismaModule],
  controllers: [CompetitionsController],
  providers: [CompetitionsService, FinishlynxService, StartListImportService],
})
export class CompetitionsModule {}
