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
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientOutputDto } from './dto/patient-output.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/rbac/roles.guard';
import { Roles } from '../auth/rbac/roles.decorator';
import { Role } from '../auth/rbac/roles.enum';

@ApiTags('Patients / Workers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Register new patient or migrant worker' })
  create(@Body() dto: CreatePatientDto, @Request() req: any): Promise<PatientOutputDto> {
    return this.patientService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Get all patients with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.patientService.findAll(page, limit);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Search patients by name, phone, blood group, location, Aadhaar' })
  search(
    @Body()
    filters: {
      query?: string;
      bloodType?: string;
      nativeState?: string;
      phone?: string;
      tenantId?: string;
      aadhaarNumber?: string;
    },
  ): Promise<PatientOutputDto[]> {
    return this.patientService.search(filters);
  }

  @Get('patient-id/:patientId')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Get patient by patientId (e.g., PAT-1732567890123)' })
  getByPatientId(@Param('patientId') patientId: string): Promise<PatientOutputDto> {
    return this.patientService.getByPatientId(patientId);
  }

  @Get('qr/:patientId')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Get QR code for patient health card' })
  getQRCode(@Param('patientId') patientId: string): Promise<{ qrCode: string; payload: any }> {
    return this.patientService.getQRCode(patientId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Get patient by MongoDB ID' })
  findOne(@Param('id') id: string): Promise<PatientOutputDto> {
    return this.patientService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Update patient information' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Request() req: any,
  ): Promise<PatientOutputDto> {
    return this.patientService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Soft delete patient record' })
  remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.patientService.remove(id, req.user.userId);
  }

  // Patient self-service endpoints
  @Get('me/profile')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Get my patient profile (for logged-in patients)' })
  getMyProfile(@Request() req: any): Promise<PatientOutputDto> {
    return this.patientService.getProfileByUserId(req.user.userId);
  }

  @Patch('me/profile')
  @Roles(Role.PATIENT)
  @ApiOperation({ summary: 'Update my patient profile (for logged-in patients)' })
  updateMyProfile(@Body() dto: UpdatePatientDto, @Request() req: any): Promise<PatientOutputDto> {
    return this.patientService.updateProfileByUserId(req.user.userId, dto);
  }
}
