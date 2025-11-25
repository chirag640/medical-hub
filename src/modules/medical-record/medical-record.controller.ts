import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordOutputDto } from './dto/medical-record-output.dto';

@Controller('medicalrecords')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMedicalRecordDto): Promise<MedicalRecordOutputDto> {
    return this.medicalRecordService.create(dto);
  }

  @Get()
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.medicalRecordService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<MedicalRecordOutputDto> {
    return this.medicalRecordService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
  ): Promise<MedicalRecordOutputDto> {
    return this.medicalRecordService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.medicalRecordService.remove(id);
  }
}
