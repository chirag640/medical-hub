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
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentOutputDto } from './dto/appointment-output.dto';
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

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @ApiOperation({
    summary: 'Book new appointment',
    description: `
      Create a new appointment for a patient with a doctor.
      
      **Authorization Required:** Admin, Receptionist, Doctor, or Patient
      
      **Required Fields:**
      - appointmentDate: Date and time of appointment
      - duration: Duration in minutes
      - reason: Reason for visit
      - patient: Patient reference (object or ID)
      - doctor: Doctor reference (object or ID)
      - fee: Consultation fee
      
      **Optional Fields:**
      - status: Defaults to 'Scheduled'
      - notes, diagnosis, prescription
      - isPaid: Payment status
      
      **Status Values:**
      - Scheduled: Initial state
      - Confirmed: Patient confirmed attendance
      - In Progress: Doctor consultation ongoing
      - Completed: Consultation finished
      - Cancelled: Appointment cancelled
      - No Show: Patient didn't attend
      
      **Use Cases:**
      - Patients book appointments online
      - Receptionists schedule walk-in appointments
      - Doctors create follow-up appointments
      
      **Note:** Appointment confirmation may require patient consent.
    `,
  })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: AppointmentOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or slot not available',
    type: ValidationErrorResponseDto,
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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.PATIENT)
  create(@Body() dto: CreateAppointmentDto, @Request() req: any): Promise<AppointmentOutputDto> {
    return this.appointmentService.create(dto, req.user.userId);
  }

  @ApiOperation({
    summary: 'Get all appointments with pagination',
    description: `
      Retrieve paginated list of all appointments.
      
      **Authorization Required:** Admin, Receptionist, Doctor, or Nurse
      
      **Pagination:**
      - Default: page=1, limit=10
      - Maximum limit: 100 per request
      
      **Response includes:**
      - Appointment date/time and duration
      - Patient and doctor information
      - Status (Scheduled, Confirmed, Completed, etc.)
      - Fees and payment status
      
      **Use Cases:**
      - View daily appointment schedule
      - Manage appointment queue
      - Generate appointment reports
      
      **Filtering:** Consider adding query params for date range, doctor, patient, status filtering.
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
    description: 'Paginated list of appointments',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/AppointmentOutputDto' } },
        total: { type: 'number', example: 200 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 20 },
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
    return this.appointmentService.findAll(page, limit);
  }

  @ApiOperation({
    summary: 'Get appointment by ID',
    description: `
      Retrieve detailed appointment information by ID.
      
      **Authorization Required:** Admin, Receptionist, Doctor, Nurse, or the Patient
      
      **Returns:**
      - Complete appointment details
      - Patient and doctor information
      - Status and notes
      - Prescription if available
      - Payment information
      
      **Use Cases:**
      - View appointment details
      - Check appointment status
      - Access prescription/diagnosis
      
      **Privacy:** Patients can only view their own appointments.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment details',
    type: AppointmentOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.PATIENT)
  findOne(@Param('id') id: string): Promise<AppointmentOutputDto> {
    return this.appointmentService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update appointment',
    description: `
      Update existing appointment details.
      
      **Authorization Required:** Admin, Receptionist, or Doctor
      
      **Updatable Fields:**
      - appointmentDate, duration
      - status (Scheduled → Confirmed → In Progress → Completed)
      - notes, diagnosis, prescription
      - isPaid (payment status)
      
      **Status Workflow:**
      1. Scheduled: Initial booking
      2. Confirmed: Patient confirms
      3. In Progress: Doctor starts consultation
      4. Completed: Consultation finished with notes
      5. Cancelled: By patient/admin
      6. No Show: Patient didn't attend
      
      **Use Cases:**
      - Reschedule appointments
      - Update appointment status
      - Add diagnosis and prescription after consultation
      - Mark payment received
      
      **Audit Trail:** lastModifiedBy tracked automatically.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    type: AppointmentOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Patch(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @Request() req: any,
  ): Promise<AppointmentOutputDto> {
    return this.appointmentService.update(id, dto, req.user.userId);
  }

  @ApiOperation({
    summary: '[ADMIN] Cancel appointment',
    description: `
      Cancel/delete an appointment.
      
      **Authorization Required:** Admin or Receptionist only
      
      **What Happens:**
      - Appointment status changed to 'Cancelled'
      - Slot becomes available for rebooking
      - Patient notified (if notification enabled)
      - Audit trail recorded
      
      **Use Cases:**
      - Patient requests cancellation
      - Doctor unavailable
      - Emergency rescheduling
      - Duplicate appointments
      
      **Note:** Completed appointments cannot be cancelled. Historical data retained for audit.
      
      **Alternative:** Use PATCH to update status to 'Cancelled' for soft cancellation.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Appointment MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Appointment cancelled successfully (no content)',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
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
    return this.appointmentService.remove(id, req.user.userId);
  }
}
