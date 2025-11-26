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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionOutputDto } from './dto/prescription-output.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/rbac/roles.guard';
import { Roles } from '../auth/rbac/roles.decorator';
import { Role } from '../auth/rbac/roles.enum';
import {
  ValidationErrorResponseDto,
  NotFoundErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
} from '../../common/swagger-responses.dto';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @ApiOperation({
    summary: 'Create new prescription',
    description: `
      Create a new prescription for a patient.
      
      **Authorization Required:** Doctor only
      
      **Required Fields:**
      - patient: Patient reference (object or ID)
      - doctor: Doctor reference (object or ID)
      - medications: Array of medication objects with:
        - name: Medication name
        - dosage: Dosage instructions
        - frequency: How often to take
        - duration: Treatment duration
      
      **Optional Fields:**
      - diagnosis: Medical diagnosis
      - notes: Additional instructions
      - appointmentId: Related appointment reference
      
      **Use Cases:**
      - Doctor prescribes medication after consultation
      - Follow-up prescription for chronic conditions
      - Emergency prescription
      
      **Security:** Only doctors can create prescriptions. Patient and doctor IDs validated.
      
      **Validation:**
      - Medications array must contain at least one item
      - Each medication must have name, dosage, and frequency
    `,
  })
  @ApiBody({ type: CreatePrescriptionDto })
  @ApiResponse({
    status: 201,
    description: 'Prescription created successfully',
    type: PrescriptionOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Doctor only',
    type: ForbiddenErrorResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.DOCTOR)
  create(@Body() dto: CreatePrescriptionDto): Promise<PrescriptionOutputDto> {
    return this.prescriptionService.create(dto);
  }

  @ApiOperation({
    summary: 'Get all prescriptions with pagination',
    description: `
      Retrieve paginated list of all prescriptions.
      
      **Authorization Required:** Admin, Doctor, or Nurse
      
      **Pagination:**
      - Default: page=1, limit=10
      - Maximum limit: 100 per request
      
      **Response includes:**
      - Patient and doctor information
      - Medications list with dosage instructions
      - Diagnosis and notes
      - Related appointment reference
      
      **Use Cases:**
      - View pharmacy orders
      - Generate prescription reports
      - Track medication history
      
      **Privacy:** Consider filtering prescriptions by doctor or patient based on role.
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-indexed)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (max 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of prescriptions',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/PrescriptionOutputDto' } },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 15 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    type: ForbiddenErrorResponseDto,
  })
  @Get()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.prescriptionService.findAll(page, limit);
  }

  @ApiOperation({
    summary: 'Get prescription by ID',
    description: `
      Retrieve detailed prescription information by ID.
      
      **Authorization Required:** Admin, Doctor, Nurse, or the Patient
      
      **Returns:**
      - Complete prescription details
      - Patient and doctor information
      - Full medications list with:
        - Medication names
        - Dosage instructions
        - Frequency and duration
      - Diagnosis and clinical notes
      
      **Use Cases:**
      - View prescription for pharmacy
      - Patient views their prescription
      - Doctor reviews previous prescriptions
      
      **Privacy:** Patients can only view their own prescriptions.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Prescription MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Prescription details',
    type: PrescriptionOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT)
  findOne(@Param('id') id: string): Promise<PrescriptionOutputDto> {
    return this.prescriptionService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update prescription',
    description: `
      Update existing prescription details.
      
      **Authorization Required:** Doctor only (original prescriber recommended)
      
      **Updatable Fields:**
      - medications: Add/remove/modify medications
      - diagnosis: Update diagnosis
      - notes: Add additional instructions
      
      **Use Cases:**
      - Modify medication dosage
      - Add new medications to existing prescription
      - Update clinical notes
      - Correct prescription errors
      
      **Security:** Only doctors can update prescriptions. Consider restricting to original prescriber.
      
      **Audit Trail:** lastModifiedBy and modification timestamp tracked automatically.
      
      **Important:** Prescription changes should be documented for medical-legal compliance.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Prescription MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdatePrescriptionDto })
  @ApiResponse({
    status: 200,
    description: 'Prescription updated successfully',
    type: PrescriptionOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Doctor only',
    type: ForbiddenErrorResponseDto,
  })
  @Patch(':id')
  @Roles(Role.DOCTOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDto,
  ): Promise<PrescriptionOutputDto> {
    return this.prescriptionService.update(id, dto);
  }

  @ApiOperation({
    summary: '[ADMIN] Delete prescription',
    description: `
      Delete a prescription record.
      
      **Authorization Required:** Admin only
      
      **What Happens:**
      - Prescription permanently removed from database
      - Historical reference may be lost
      - Cannot be undone
      
      **Use Cases:**
      - Remove duplicate prescriptions
      - Delete test/demo data
      - Comply with patient deletion requests (GDPR)
      
      **⚠️ Warning:** Deleting prescriptions may affect medical record integrity. Consider soft-delete or archival instead.
      
      **Best Practice:** Maintain prescription history for medical-legal compliance. Use status flags instead of deletion.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Prescription MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Prescription deleted successfully (no content)',
  })
  @ApiResponse({
    status: 404,
    description: 'Prescription not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin only',
    type: ForbiddenErrorResponseDto,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.prescriptionService.remove(id);
  }
}
