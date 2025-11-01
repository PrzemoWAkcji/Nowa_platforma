import { Module } from '@nestjs/common';
import { RelayTeamsService } from './relay-teams.service';
import { RelayTeamsController } from './relay-teams.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RelayTeamsController],
  providers: [RelayTeamsService],
  exports: [RelayTeamsService],
})
export class RelayTeamsModule {}