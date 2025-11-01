import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  create(@Body() createRecordDto: CreateRecordDto) {
    return this.recordsService.create(createRecordDto);
  }

  @Get()
  @Public()
  findAll(
    @Query('type') type?: string,
    @Query('eventName') eventName?: string,
    @Query('gender') gender?: string,
    @Query('category') category?: string,
    @Query('nationality') nationality?: string,
    @Query('isActive') isActive?: string,
    @Query('isIndoor') isIndoor?: string,
  ) {
    const filters = {};
    if (type) filters['type'] = type;
    if (eventName) filters['eventName'] = eventName;
    if (gender) filters['gender'] = gender;
    if (category) filters['category'] = category;
    if (nationality) filters['nationality'] = nationality;
    if (isActive !== undefined) filters['isActive'] = isActive === 'true';
    if (isIndoor !== undefined) filters['isIndoor'] = isIndoor === 'true';

    return this.recordsService.findAll(filters);
  }

  @Get('statistics')
  @Public()
  getStatistics() {
    return this.recordsService.getRecordStatistics();
  }

  @Get('check-potential')
  @Public()
  checkPotentialRecord(
    @Query('eventName') eventName: string,
    @Query('result') result: string,
    @Query('unit') unit: string,
    @Query('gender') gender: string,
    @Query('category') category: string,
    @Query('nationality') nationality: string,
    @Query('isIndoor') isIndoor?: string,
  ) {
    return this.recordsService.checkPotentialRecord(
      eventName,
      result,
      unit,
      gender,
      category,
      nationality,
      isIndoor === 'true',
    );
  }

  @Get('best')
  @Public()
  getBestRecord(
    @Query('eventName') eventName: string,
    @Query('type') type: string,
    @Query('gender') gender: string,
    @Query('category') category: string,
    @Query('nationality') nationality?: string,
    @Query('isIndoor') isIndoor?: string,
  ) {
    return this.recordsService.getBestRecord(
      eventName,
      type,
      gender,
      category,
      nationality,
      isIndoor === 'true',
    );
  }

  @Post('import')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async importRecords(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const csvData = file.buffer.toString('utf-8');
    return this.recordsService.importRecords(csvData);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.recordsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ORGANIZER')
  update(@Param('id') id: string, @Body() updateRecordDto: UpdateRecordDto) {
    return this.recordsService.update(id, updateRecordDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.recordsService.remove(id);
  }
}