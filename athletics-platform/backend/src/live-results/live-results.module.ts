import { Module } from '@nestjs/common';
import { LiveResultsService } from './live-results.service';
import { LiveResultsController } from './live-results.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LiveResultsController],
  providers: [LiveResultsService],
  exports: [LiveResultsService],
})
export class LiveResultsModule {}
