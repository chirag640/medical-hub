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
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorOutputDto } from './dto/doctor-output.dto';
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

@ApiTags('Doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @ApiOperation({
    summary: '[ADMIN] Create doctor profile',
    description: `
      Admin-only endpoint to create doctor profiles.
      
      **Authorization Required:** Admin only
      
      **Pre-requisite:** Doctor user account must exist (created via /auth/admin/create-user)
      
      **Required Fields:**
      - userId: Reference to User account with Doctor role
      - firstName, lastName, specialization
      - licenseNumber, email, phone
      
      **Optional Fields:**
      - department, education, experience
      - consultationFee, languages
      - availability schedule
      
      **What Happens:**
      1. Doctor profile created and linked to user account
      2. Doctor can login and manage profile
      3. Available for patient appointments
      
      **Workflow:**
      1. Admin creates user: POST /auth/admin/create-user (role: Doctor)
      2. Admin creates doctor profile: POST /doctors (with userId)
      3. Doctor logs in and completes profile: PATCH /doctors/me/profile
    `,
  })
  @ApiBody({ type: CreateDoctorDto })
  @ApiResponse({
    status: 201,
    description: 'Doctor profile created successfully',
    type: DoctorOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or userId already has doctor profile',
    type: ValidationErrorResponseDto,
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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateDoctorDto, @Request() req: any): Promise<DoctorOutputDto> {
    return this.doctorService.create(dto, req.user.userId);
  }

  @ApiOperation({
    summary: 'Get all doctors with pagination',
    description: `
      Retrieve paginated list of all doctors in the system.
      
      **Authorization Required:** Admin, Receptionist, or Doctor
      
      **Pagination:**
      - Default: page=1, limit=10
      - Maximum limit: 100 per request
      
      **Response includes:**
      - Doctor information (name, specialization, department)
      - Contact details (email, phone)
      - Availability status
      - Consultation fees
      
      **Use Cases:**
      - Browse available doctors for appointments
      - Doctor directory for patients
      - Staff management
      
      **Filtered Search:** Use POST /doctors/search for advanced filtering
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
    description: 'Paginated list of doctors',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/DoctorOutputDto' } },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 5 },
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
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.doctorService.findAll(page, limit);
  }

  @ApiOperation({
    summary: 'Get doctor by ID',
    description: `
      Retrieve doctor profile by MongoDB ObjectId.
      
      **Authorization Required:** Admin, Receptionist, or Doctor
      
      **Returns:**
      - Complete doctor profile
      - Specialization and education
      - Availability schedule
      - Consultation fees
      
      **Use Cases:**
      - View doctor details for appointment booking
      - Staff directory lookup
      - Doctor profile page
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor profile',
    type: DoctorOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  findOne(@Param('id') id: string): Promise<DoctorOutputDto> {
    return this.doctorService.findOne(id);
  }

  @ApiOperation({
    summary: '[ADMIN] Update doctor profile',
    description: `
      Update doctor profile information.
      
      **Authorization Required:** Admin or the Doctor themselves
      
      **Updatable Fields:**
      - Professional: specialization, department, licenseNumber
      - Contact: phone, email
      - Schedule: availability, consultationFee
      - Details: education, experience, languages
      
      **Non-Updatable:**
      - userId (immutable link to user account)
      
      **Audit Trail:**
      - lastModifiedBy automatically recorded
      - Update timestamp tracked
      
      **Note:** Partial updates supported - only send fields to change.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateDoctorDto })
  @ApiResponse({
    status: 200,
    description: 'Doctor profile updated successfully',
    type: DoctorOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
    @Request() req: any,
  ): Promise<DoctorOutputDto> {
    return this.doctorService.update(id, dto, req.user.userId);
  }

  @ApiOperation({
    summary: '[ADMIN] Soft delete doctor profile',
    description: `
      Soft delete doctor profile (marks as deleted/inactive).
      
      **Authorization Required:** Admin only
      
      **What Happens:**
      - Doctor marked as deleted (isDeleted = true)
      - Profile hidden from appointment booking
      - User account remains (can login but not see patients)
      - Data retained for audit/compliance
      
      **Use Cases:**
      - Doctor leaves hospital
      - Profile deactivation for inactive staff
      - Data privacy compliance
      
      **Recovery:**
      - Contact admin to restore profile
      - Reactivation possible
      
      **Note:** User account must be separately managed via user admin endpoints.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Doctor profile deleted successfully (no content)',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found',
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
  remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.doctorService.remove(id, req.user.userId);
  }

  // Doctor self-service endpoints
  @ApiOperation({
    summary: '[DOCTOR] Get my profile',
    description: `
      Doctor self-service endpoint to view own profile.
      
      **Authorization Required:** Doctor role only
      
      **Returns:**
      - Complete doctor profile
      - Professional credentials
      - Availability schedule
      - Consultation settings
      
      **Use Cases:**
      - View personal professional information
      - Check profile completeness
      - Review availability settings
      
      **Note:** Doctors can only access their own profile.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Doctor profile',
    type: DoctorOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found - Contact admin to create doctor profile',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get('me/profile')
  @Roles(Role.DOCTOR)
  getMyProfile(@Request() req: any): Promise<DoctorOutputDto> {
    return this.doctorService.getProfileByUserId(req.user.userId);
  }

  @ApiOperation({
    summary: '[DOCTOR] Update my profile',
    description: `
      Doctor self-service endpoint to update own profile.
      
      **Authorization Required:** Doctor role only
      
      **Updatable Fields:**
      - Contact: phone, email
      - Professional: education, experience details
      - Schedule: availability hours
      - Settings: consultation fee, languages
      - Bio and profile information
      
      **Non-Updatable:**
      - License number (contact admin)
      - Specialization (contact admin)
      - Department assignment (contact admin)
      
      **Use Cases:**
      - Update contact information
      - Modify availability schedule
      - Update consultation fees
      - Complete profile after admin creates it
      
      **Note:** Changes visible immediately to patients and staff.
    `,
  })
  @ApiBody({ type: UpdateDoctorDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: DoctorOutputDto,
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
  @Roles(Role.DOCTOR)
  updateMyProfile(@Body() dto: UpdateDoctorDto, @Request() req: any): Promise<DoctorOutputDto> {
    return this.doctorService.updateProfileByUserId(req.user.userId, dto);
  }
}
