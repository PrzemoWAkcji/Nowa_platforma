import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  Header,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import {
  ImportStartListDto,
  StartListFormat,
} from './dto/import-startlist.dto';
import { FinishlynxService } from '../finishlynx/finishlynx.service';
import { StartListImportService } from './startlist-import.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Response } from 'express';
import * as iconv from 'iconv-lite';

@Controller('competitions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompetitionsController {
  constructor(
    private readonly competitionsService: CompetitionsService,
    private readonly finishlynxService: FinishlynxService,
    private readonly startListImportService: StartListImportService,
  ) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  create(@Body() createCompetitionDto: CreateCompetitionDto) {
    return this.competitionsService.create(createCompetitionDto);
  }

  @Get()
  findAll() {
    return this.competitionsService.findAll();
  }

  @Get('public')
  @Public()
  findPublic() {
    return this.competitionsService.findPublic();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.competitionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  update(
    @Param('id') id: string,
    @Body() updateCompetitionDto: UpdateCompetitionDto,
  ) {
    return this.competitionsService.update(id, updateCompetitionDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ORGANIZER')
  remove(@Param('id') id: string) {
    return this.competitionsService.remove(id);
  }

  @Get(':id/agent-config')
  @Roles('ADMIN', 'JUDGE')
  @Header('Content-Type', 'application/json')
  async downloadAgentConfig(
    @Param('id') id: string,
    @Req() request: { user: { id: string; email: string; role: string } },
    @Res() response: Response,
  ) {
    const configData = await this.finishlynxService.generateAgentConfigFile(
      id,
      request.user,
    );

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${configData.filename}"`,
    );
    response.setHeader('Content-Type', 'application/json');
    response.send(configData.content);
  }

  @Post(':id/live-results/toggle')
  @Roles('ADMIN', 'ORGANIZER')
  async toggleLiveResults(
    @Param('id') id: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.competitionsService.toggleLiveResults(id, body.enabled);
  }

  @Get('live/:token')
  @Public()
  async getLiveResults(@Param('token') token: string) {
    const competition =
      await this.competitionsService.findByLiveResultsToken(token);
    if (!competition || !competition.liveResultsEnabled) {
      throw new Error('Live results not available');
    }
    return competition;
  }

  @Get('agent/:agentId')
  async getCompetitionByAgentId(@Param('agentId') agentId: string) {
    return this.competitionsService.findByAgentId(agentId);
  }

  @Post(':id/import-startlist')
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  @UseInterceptors(FileInterceptor('file'))
  async importStartList(
    @Param('id') competitionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('format') format?: string,
    @Body('updateExisting') updateExisting?: string,
    @Body('createMissingAthletes') createMissingAthletes?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Plik CSV jest wymagany');
    }

    // Spróbuj różnych kodowań
    let csvData: string;
    try {
      // Najpierw spróbuj UTF-8
      csvData = file.buffer.toString('utf-8');
      // Sprawdź czy są znaki zastępcze (�)
      if (csvData.includes('�')) {
        // Spróbuj Windows-1250 (polskie kodowanie)
        csvData = iconv.decode(file.buffer, 'windows-1250');
        // Jeśli nadal są problemy, spróbuj ISO-8859-2
        if (csvData.includes('�')) {
          csvData = iconv.decode(file.buffer, 'iso-8859-2');
        }
      }
    } catch (error) {
      // Fallback do UTF-8
      csvData = file.buffer.toString('utf-8');
    }
    const importDto: ImportStartListDto = {
      competitionId,
      csvData,
      format:
        format === 'international'
          ? StartListFormat.ROSTER
          : StartListFormat.PZLA,
    };

    return this.startListImportService.importStartList(importDto);
  }

  @Post(':id/import-startlist-json')
  @Roles('ADMIN', 'ORGANIZER', 'JUDGE')
  async importStartListJson(
    @Param('id') competitionId: string,
    @Body() body: { csvData: string; format?: string },
  ) {
    if (!body.csvData) {
      throw new BadRequestException('Dane CSV są wymagane');
    }

    const importDto: ImportStartListDto = {
      competitionId,
      csvData: body.csvData,
      format: body.format === 'international'
        ? StartListFormat.ROSTER
        : body.format === 'PZLA'
        ? StartListFormat.PZLA
        : StartListFormat.AUTO,
    };

    return this.startListImportService.importStartList(importDto);
  }

  @Post('update-statuses')
  @Roles('ADMIN', 'ORGANIZER')
  async updateCompetitionStatuses() {
    return this.competitionsService.updateCompetitionStatuses();
  }

  @Post(':id/logos')
  @Roles('ADMIN', 'ORGANIZER')
  @UseInterceptors(FilesInterceptor('logos', 5, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml|webp)$/)) {
        return callback(new BadRequestException('Tylko pliki obrazów są dozwolone'), false);
      }
      callback(null, true);
    },
  }))
  async uploadLogos(
    @Param('id') competitionId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nie przesłano żadnych plików');
    }

    return this.competitionsService.uploadLogos(competitionId, files);
  }

  @Delete(':id/logos/:logoId')
  @Roles('ADMIN', 'ORGANIZER')
  async deleteLogo(
    @Param('id') competitionId: string,
    @Param('logoId') logoId: string,
  ) {
    return this.competitionsService.deleteLogo(competitionId, logoId);
  }

  @Get(':id/logos')
  async getLogos(@Param('id') competitionId: string) {
    return this.competitionsService.getLogos(competitionId);
  }
}
