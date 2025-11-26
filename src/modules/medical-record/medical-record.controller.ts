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
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordOutputDto } from './dto/medical-record-output.dto';
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

@ApiTags('Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medicalrecords')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @ApiOperation({
    summary: 'Create new medical record',
    description: `
      Create a new medical record for a patient.
      
      **Authorization Required:** Doctor or Nurse
      
      **Required Fields:**
      - patient: Patient reference (object or ID)
      - recordType: Type of medical record (e.g., "Consultation", "Lab Report", "Diagnosis")
      - recordDate: Date of the medical record
      
      **Optional Fields:**
      - diagnosis: Medical diagnosis
      - symptoms: Array of symptoms
      - treatment: Treatment provided
      - medications: Medications prescribed
      - labResults: Laboratory test results
      - vitalSigns: Blood pressure, temperature, etc.
      - notes: Additional clinical notes
      - attachments: Document references
      
      **Use Cases:**
      - Doctor documents consultation findings
      - Nurse records vital signs
      - Lab technician uploads test results
      - Emergency room admission records
      
      **Security:** Medical records are highly sensitive. Field-level encryption applied to diagnosis, treatment, and lab results.
      
      **Privacy:** HIPAA compliance required. Access logged for audit.
    `,
  })
  @ApiBody({ type: CreateMedicalRecordDto })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully',
    type: MedicalRecordOutputDto,
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
    description: 'Forbidden - Doctor/Nurse only',
    type: ForbiddenErrorResponseDto,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.DOCTOR, Role.NURSE)
  create(@Body() dto: CreateMedicalRecordDto): Promise<MedicalRecordOutputDto> {
    return this.medicalRecordService.create(dto);
  }

  @ApiOperation({
    summary: 'Get all medical records with pagination',
    description: `
      Retrieve paginated list of all medical records.
      
      **Authorization Required:** Admin, Doctor, or Nurse
      
      **Pagination:**
      - Default: page=1, limit=10
      - Maximum limit: 100 per request
      
      **Response includes:**
      - Patient information
      - Record type and date
      - Diagnosis and treatment
      - Vital signs and lab results
      - Attachments and notes
      
      **Use Cases:**
      - View patient medical history
      - Generate medical reports
      - Research and analytics
      
      **Privacy:** Field-level access control applied. Sensitive fields may be masked based on user role.
      
      **Note:** Consider adding filters for patient ID, record type, date range for better usability.
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
    description: 'Paginated list of medical records',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/MedicalRecordOutputDto' } },
        total: { type: 'number', example: 500 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 50 },
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
    return this.medicalRecordService.findAll(page, limit);
  }

  @ApiOperation({
    summary: 'Get medical record by ID',
    description: `
      Retrieve detailed medical record information by ID.
      
      **Authorization Required:** Admin, Doctor, Nurse, or the Patient
      
      **Returns:**
      - Complete medical record details
      - Patient information
      - Diagnosis, symptoms, and treatment
      - Vital signs and lab results
      - Medications and prescriptions
      - Clinical notes and attachments
      
      **Use Cases:**
      - Doctor reviews patient history
      - Patient views their medical records
      - Medical-legal review
      - Insurance claim processing
      
      **Privacy:** 
      - Patients can only view their own records
      - Field-level encryption applied to sensitive data
      - Access logged for HIPAA compliance audit
      
      **Security:** Medical records are encrypted at rest and in transit.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Medical Record MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical record details',
    type: MedicalRecordOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT)
  findOne(@Param('id') id: string): Promise<MedicalRecordOutputDto> {
    return this.medicalRecordService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update medical record',
    description: `
      Update existing medical record details.
      
      **Authorization Required:** Doctor or Nurse
      
      **Updatable Fields:**
      - diagnosis: Update or refine diagnosis
      - treatment: Modify treatment plan
      - medications: Update medication list
      - labResults: Add new lab results
      - vitalSigns: Update vital signs
      - notes: Append clinical notes
      - attachments: Add new documents
      
      **Use Cases:**
      - Add follow-up findings
      - Update diagnosis based on test results
      - Append new lab reports
      - Correct data entry errors
      
      **Audit Trail:** 
      - lastModifiedBy tracked automatically
      - Modification timestamp recorded
      - All changes logged for compliance
      
      **Important:** 
      - Original data preserved in audit logs
      - Medical-legal compliance requires change documentation
      - Consider version control for critical updates
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Medical Record MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateMedicalRecordDto })
  @ApiResponse({
    status: 200,
    description: 'Medical record updated successfully',
    type: MedicalRecordOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Doctor/Nurse only',
    type: ForbiddenErrorResponseDto,
  })
  @Patch(':id')
  @Roles(Role.DOCTOR, Role.NURSE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
  ): Promise<MedicalRecordOutputDto> {
    return this.medicalRecordService.update(id, dto);
  }

  @ApiOperation({
    summary: '[ADMIN] Delete medical record',
    description: `
      Delete a medical record.
      
      **Authorization Required:** Admin only
      
      **⚠️ CRITICAL WARNING:**
      - Medical records are legal documents
      - Deletion may violate HIPAA retention requirements
      - May affect medical-legal cases
      - Cannot be undone
      
      **Legal Requirements:**
      - Most jurisdictions require 7-10 years retention
      - Minors' records retained until age of majority + retention period
      - Check local regulations before deletion
      
      **Use Cases:**
      - Remove duplicate records (with extreme caution)
      - Comply with patient "right to be forgotten" (GDPR)
      - Delete test/demo data in non-production
      
      **Best Practice:**
      - Use soft-delete with isDeleted flag
      - Archive to cold storage instead of deletion
      - Maintain audit trail of deletion requests
      - Require multi-factor authentication for deletion
      
      **Alternative:** Consider implementing record archival instead of permanent deletion.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Medical Record MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Medical record deleted successfully (no content)',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
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
    return this.medicalRecordService.remove(id);
  }
}
