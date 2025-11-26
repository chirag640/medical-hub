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
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientOutputDto } from './dto/patient-output.dto';
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

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @ApiOperation({
    summary: 'Register new patient',
    description: `
      Create a new patient record in the system.
      
      **Authorization Required:** Admin, Receptionist, Doctor, or Nurse
      
      **Use Cases:**
      - Register walk-in patients at hospital/clinic
      - Onboard migrant workers at construction sites
      - Create patient profiles for medical camps
      
      **Required Fields:**
      - firstName, lastName, gender, dateOfBirth, phone
      - bloodType (defaults to 'Unknown' if not provided)
      - consentGiven (HIPAA/GDPR compliance)
      
      **Optional Fields:**
      - email (required for patient self-service account)
      - aadhaarNumber, ssn, passportNumber (encrypted in database)
      - address, nativeState, nativeDistrict
      - medicalHistory, allergies, currentMedication (encrypted)
      - emergencyContact, insuranceNumber
      
      **What Happens:**
      1. Patient record created with unique PAT-XXXXX ID
      2. QR code generated for health card
      3. If email provided, patient can login to view/update profile
      
      **Note:** Sensitive fields (Aadhaar, SSN, medical history) are automatically encrypted.
    `,
  })
  @ApiBody({ type: CreatePatientDto })
  @ApiResponse({
    status: 201,
    description: 'Patient created successfully',
    type: PatientOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid input data',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
    type: ForbiddenErrorResponseDto,
    example: {
      statusCode: 403,
      message: 'Insufficient permissions. Required roles: Admin, Receptionist, Doctor, Nurse',
      error: 'Forbidden',
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  create(@Body() dto: CreatePatientDto, @Request() req: any): Promise<PatientOutputDto> {
    return this.patientService.create(dto, req.user.userId);
  }

  @ApiOperation({
    summary: 'Get all patients with pagination',
    description: `
      Retrieve paginated list of all patients in the system.
      
      **Authorization Required:** Admin, Receptionist, Doctor, or Nurse
      
      **Pagination:**
      - Default: page=1, limit=10
      - Maximum limit: 100 per request
      
      **Response includes:**
      - Patient demographic information
      - Contact details
      - Medical info (allergies, blood type)
      - QR code for health card
      
      **Use Cases:**
      - Browse all registered patients
      - Export patient lists for reports
      - Manage patient database
      
      **Note:** Sensitive encrypted fields are returned only to authorized roles.
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
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of patients',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/PatientOutputDto' } },
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
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.patientService.findAll(page, limit);
  }

  @ApiOperation({
    summary: 'Search patients by multiple criteria',
    description: `
      Advanced search for patients using various filters.
      
      **Authorization Required:** Admin, Receptionist, Doctor, or Nurse
      
      **Search Filters:**
      - query: Search by name (firstName, lastName)
      - phone: Search by phone number
      - bloodType: Filter by blood type (A+, B+, O+, etc.)
      - nativeState: Filter by home state
      - aadhaarNumber: Search by Aadhaar (exact match)
      - tenantId: Filter by hospital/clinic (multi-tenant)
      
      **Use Cases:**
      - Find patients by name for appointments
      - Search by phone for quick identification
      - Filter by blood type for emergency blood needs
      - Find migrant workers from specific states
      
      **Returns:** Array of matching patient records
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Array of matching patients',
    type: [PatientOutputDto],
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
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
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

  @ApiOperation({
    summary: 'Get patient by PAT-ID',
    description: `
      Retrieve patient by their unique Patient ID (PAT-XXXXX format).
      
      **Authorization Required:** Admin, Receptionist, Doctor, or Nurse
      
      **Patient ID Format:** PAT-{timestamp}
      Example: PAT-1732567890123
      
      **Use Cases:**
      - Scan QR code to get patient health card
      - Retrieve patient using printed ID card
      - Link appointment to patient ID
      
      **Note:** This is different from MongoDB _id. Use this for human-readable IDs.
    `,
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier (PAT-XXXXX)',
    example: 'PAT-1732567890123',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient record',
    type: PatientOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get('patient-id/:patientId')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  getByPatientId(@Param('patientId') patientId: string): Promise<PatientOutputDto> {
    return this.patientService.getByPatientId(patientId);
  }

  @ApiOperation({
    summary: 'Generate QR code for patient health card',
    description: `
      Generate QR code containing patient health information.
      
      **Authorization Required:** Admin, Receptionist, Doctor, or Nurse
      
      **QR Code Contains:**
      - Patient ID (PAT-XXXXX)
      - Name, age, gender, blood type
      - Emergency contact information
      - Allergies (if any)
      
      **Use Cases:**
      - Print on patient ID cards
      - Quick patient identification in emergencies
      - Mobile health card display
      
      **Returns:**
      - qrCode: Base64 encoded QR image
      - payload: JSON data encoded in QR code
    `,
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient unique identifier',
    example: 'PAT-1732567890123',
  })
  @ApiResponse({
    status: 200,
    description: 'QR code generated successfully',
    schema: {
      properties: {
        qrCode: {
          type: 'string',
          description: 'Base64 encoded QR code image',
          example: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
        },
        payload: {
          type: 'object',
          description: 'Data encoded in QR code',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
    type: NotFoundErrorResponseDto,
  })
  @Get('qr/:patientId')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  getQRCode(@Param('patientId') patientId: string): Promise<{ qrCode: string; payload: any }> {
    return this.patientService.getQRCode(patientId);
  }

  @ApiOperation({
    summary: 'Get patient by database ID',
    description: `
      Retrieve patient by MongoDB ObjectId.
      
      **Authorization Required:** Admin, Receptionist, Doctor, or Nurse
      
      **Use Cases:**
      - Get patient details for appointments
      - Fetch patient for medical records
      - Internal system operations
      
      **Note:** For QR scanning, use /patients/patient-id/:patientId instead.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient record',
    type: PatientOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  findOne(@Param('id') id: string): Promise<PatientOutputDto> {
    return this.patientService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update patient information',
    description: `
      Update existing patient record.
      
      **Authorization Required:** Admin, Receptionist, Doctor, or Nurse
      
      **Updatable Fields:**
      - Contact info (phone, email, address)
      - Medical info (allergies, medications, medical history)
      - Emergency contact
      - Insurance information
      
      **Non-Updatable:**
      - patientId (auto-generated, immutable)
      - dateOfBirth (requires admin approval for changes)
      
      **Audit Trail:**
      - lastModifiedBy field automatically updated
      - Update timestamp recorded
      
      **Note:** Partial updates supported - only send fields to change.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Patient MongoDB ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdatePatientDto })
  @ApiResponse({
    status: 200,
    description: 'Patient updated successfully',
    type: PatientOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Request() req: any,
  ): Promise<PatientOutputDto> {
    return this.patientService.update(id, dto, req.user.userId);
  }

  @ApiOperation({
    summary: '[ADMIN] Soft delete patient record',
    description: `
      Soft delete patient record (marks as deleted, doesn't remove from database).
      
      **Authorization Required:** Admin or Receptionist only
      
      **What Happens:**
      - Patient marked as deleted (isDeleted = true)
      - Record hidden from search/listing
      - Data retained for audit/compliance
      - Deletion tracked (deletedBy, deletedAt)
      
      **Use Cases:**
      - Patient requests data deletion
      - Duplicate records cleanup
      - Inactive patient archival
      
      **Recovery:**
      - Contact admin to restore deleted records
      - Data retained for compliance period
      
      **Note:** Hard delete requires database admin access.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Patient MongoDB ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Patient deleted successfully (no content)',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Receptionist only',
    type: ForbiddenErrorResponseDto,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.patientService.remove(id, req.user.userId);
  }

  // Patient self-service endpoints
  @ApiOperation({
    summary: '[PATIENT] Get my profile',
    description: `
      Patient self-service endpoint to view own profile.
      
      **Authorization Required:** Patient role only
      
      **Returns:**
      - Complete patient profile
      - Medical history and allergies
      - Emergency contact
      - QR code for health card
      
      **Use Cases:**
      - View personal medical information
      - Download health card
      - Check registered details
      
      **Note:** Patients can only access their own profile, not other patients.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Patient profile',
    type: PatientOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found - Register via /auth/register first',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get('me/profile')
  @Roles(Role.PATIENT)
  getMyProfile(@Request() req: any): Promise<PatientOutputDto> {
    return this.patientService.getProfileByUserId(req.user.userId);
  }

  @ApiOperation({
    summary: '[PATIENT] Update my profile',
    description: `
      Patient self-service endpoint to update own profile.
      
      **Authorization Required:** Patient role only
      
      **Updatable Fields:**
      - Contact: phone, email, address
      - Medical: allergies, current medications, medical history
      - Emergency contact information
      - Profile image
      
      **Non-Updatable:**
      - Name, gender, date of birth (contact admin)
      - patientId (system generated)
      
      **Use Cases:**
      - Update phone number or address
      - Add new allergies or medications
      - Update emergency contact
      
      **Note:** Changes visible immediately to healthcare providers.
    `,
  })
  @ApiBody({ type: UpdatePatientDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: PatientOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Patch('me/profile')
  @Roles(Role.PATIENT)
  updateMyProfile(@Body() dto: UpdatePatientDto, @Request() req: any): Promise<PatientOutputDto> {
    return this.patientService.updateProfileByUserId(req.user.userId, dto);
  }
}
