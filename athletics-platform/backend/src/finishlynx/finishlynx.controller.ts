import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FinishlynxService } from './finishlynx.service';
import {
  ImportFinishlynxDto,
  ImportFileDto,
  FinishlynxAthleteResultDto,
} from './dto/import-finishlynx.dto';

@Controller('finishlynx')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinishlynxController {
  constructor(private readonly finishlynxService: FinishlynxService) {}

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async importResults(@Body() importFinishlynxDto: ImportFinishlynxDto) {
    return this.finishlynxService.processImportedData(importFinishlynxDto);
  }

  @Post('import-file')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @UseInterceptors(FileInterceptor('file'))
  async importFromFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('competitionId') competitionId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nie przesłano pliku');
    }

    const fileContent = file.buffer.toString('utf-8');
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    let fileType: 'evt' | 'lif' | 'sch';

    switch (fileExtension) {
      case 'evt':
        fileType = 'evt';
        break;
      case 'lif':
        fileType = 'lif';
        break;
      case 'sch':
        fileType = 'sch';
        break;
      default:
        throw new BadRequestException(
          'Nieobsługiwany typ pliku. Obsługiwane: .evt, .lif, .sch',
        );
    }

    const importFileDto: ImportFileDto = {
      fileType,
      fileContent,
      competitionId,
    };

    return this.finishlynxService.importFromFile(importFileDto);
  }

  @Post('validate-file')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @UseInterceptors(FileInterceptor('file'))
  validateFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nie przesłano pliku');
    }

    const fileContent = file.buffer.toString('utf-8');
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (!['evt', 'lif', 'sch'].includes(fileExtension || '')) {
      throw new BadRequestException(
        'Nieobsługiwany typ pliku. Obsługiwane: .evt, .lif, .sch',
      );
    }

    return this.finishlynxService.validateFinishlynxFile(
      fileContent,
      fileExtension || '',
    );
  }

  @Get('import-history')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  getImportHistory() {
    return this.finishlynxService.getImportHistory();
  }

  @Post('manual-import')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async manualImport(@Body() importFileDto: ImportFileDto) {
    return this.finishlynxService.importFromFile(importFileDto);
  }

  @Post('preview-file')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @UseInterceptors(FileInterceptor('file'))
  async previewFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('competitionId') competitionId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nie przesłano pliku');
    }

    const fileContent = file.buffer.toString('utf-8');
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (!['evt', 'lif', 'sch'].includes(fileExtension || '')) {
      throw new BadRequestException(
        'Nieobsługiwany typ pliku. Obsługiwane: .evt, .lif, .sch',
      );
    }

    return this.finishlynxService.previewFile(
      fileContent,
      fileExtension || '',
      competitionId,
    );
  }

  @Get('event-mapping-suggestions/:competitionId/:eventName')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async getEventMappingSuggestions(
    @Param('competitionId') competitionId: string,
    @Param('eventName') eventName: string,
  ) {
    return this.finishlynxService.getEventMappingSuggestions(
      competitionId,
      decodeURIComponent(eventName),
    );
  }

  @Post('import-with-mapping')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async importWithMapping(
    @Body()
    data: {
      importData: ImportFinishlynxDto;
      eventMappings: { [finishlynxEventName: string]: string };
      competitionId: string;
    },
  ) {
    return this.finishlynxService.importWithCustomMapping(
      data.importData,
      data.eventMappings,
      data.competitionId,
    );
  }

  @Post('import-results-agent')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async importResultsFromAgent(
    @Body()
    data: {
      competitionId: string;
      fileName: string;
      results: FinishlynxAthleteResultDto[];
    },
  ) {
    return this.finishlynxService.processAgentResults(
      data.competitionId,
      data.fileName,
      data.results,
    );
  }

  @Get('export-start-lists/:competitionId')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async exportStartLists(@Param('competitionId') competitionId: string) {
    return this.finishlynxService.exportStartListsForAgent(competitionId);
  }

  @Get('generate-agent-config/:competitionId')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  async generateAgentConfig(
    @Param('competitionId') competitionId: string,
    @Req() request: { user: { id: string; email: string; role: string } },
  ) {
    return this.finishlynxService.generateAgentConfigFile(
      competitionId,
      request.user,
    );
  }
}
