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
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentOutputDto } from './dto/department-output.dto';
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

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @ApiOperation({
    summary: '[ADMIN] Create new department',
    description: `
      Create a new department/clinic in the hospital.
      
      **Authorization Required:** Admin only
      
      **Required Fields:**
      - name: Department name (e.g., "Cardiology", "Pediatrics")
      - code: Unique department code (e.g., "CARD", "PED")
      
      **Optional Fields:**
      - description: Department description
      - location: Physical location in hospital
      - headOfDepartment: Doctor reference (head of department)
      - contactNumber: Department contact number
      - email: Department email
      - services: Array of services offered
      - operatingHours: Working hours
      - isActive: Active status (default: true)
      
      **Use Cases:**
      - Hospital setup and configuration
      - Add new specialty department
      - Organize hospital structure
      
      **Examples:**
      - Cardiology: Heart and cardiovascular care
      - Pediatrics: Children's healthcare
      - Emergency: 24/7 emergency services
      - Orthopedics: Bone and joint treatment
      
      **Validation:** Department code must be unique across hospital.
    `,
  })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
    type: DepartmentOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or duplicate department code',
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
  create(@Body() dto: CreateDepartmentDto): Promise<DepartmentOutputDto> {
    return this.departmentService.create(dto);
  }

  @ApiOperation({
    summary: 'Get all departments with pagination',
    description: `
      Retrieve paginated list of all hospital departments.
      
      **Authorization Required:** All authenticated users
      
      **Pagination:**
      - Default: page=1, limit=10
      - Maximum limit: 100 per request
      
      **Response includes:**
      - Department name and code
      - Description and location
      - Head of department
      - Contact information
      - Services offered
      - Operating hours
      - Active status
      
      **Use Cases:**
      - Display department directory
      - Patient selects department for appointment
      - Hospital navigation and information
      - Staff directory
      
      **Public Access:** Consider making this endpoint publicly accessible (no auth) for hospital website.
      
      **Filter Options:** Consider adding filters for active status, services, location.
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
    description: 'Paginated list of departments',
    schema: {
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/DepartmentOutputDto' } },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.PATIENT)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.departmentService.findAll(page, limit);
  }

  @ApiOperation({
    summary: 'Get department by ID',
    description: `
      Retrieve detailed department information by ID.
      
      **Authorization Required:** All authenticated users
      
      **Returns:**
      - Complete department details
      - Department name, code, and description
      - Physical location in hospital
      - Head of department information
      - Contact details (phone, email)
      - List of services offered
      - Operating hours and schedules
      - Active/inactive status
      - Staff assigned to department
      
      **Use Cases:**
      - View department details before booking
      - Check operating hours
      - Contact department
      - Find department location
      
      **Public Info:** Most department information is non-sensitive and can be publicly displayed.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Department MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Department details',
    type: DepartmentOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR, Role.NURSE, Role.PATIENT)
  findOne(@Param('id') id: string): Promise<DepartmentOutputDto> {
    return this.departmentService.findOne(id);
  }

  @ApiOperation({
    summary: '[ADMIN] Update department',
    description: `
      Update existing department information.
      
      **Authorization Required:** Admin only
      
      **Updatable Fields:**
      - name: Department name
      - description: Department description
      - location: Physical location
      - headOfDepartment: Assign new head
      - contactNumber: Update contact info
      - email: Update email
      - services: Modify services list
      - operatingHours: Update working hours
      - isActive: Activate/deactivate department
      
      **Use Cases:**
      - Update department information
      - Assign new head of department
      - Modify services offered
      - Update contact details
      - Temporarily close department (isActive: false)
      
      **Note:** Department code is typically immutable to maintain referential integrity.
      
      **Impact:** Changes affect appointment booking and patient navigation.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Department MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
    type: DepartmentOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
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
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto): Promise<DepartmentOutputDto> {
    return this.departmentService.update(id, dto);
  }

  @ApiOperation({
    summary: '[ADMIN] Delete department',
    description: `
      Delete a department from the hospital.
      
      **Authorization Required:** Admin only
      
      **⚠️ Warning:**
      - Cannot delete department with active appointments
      - Cannot delete department with assigned doctors
      - Historical references may be affected
      - Cannot be undone
      
      **Pre-deletion Checks:**
      - Reassign all doctors to other departments
      - Cancel or complete all scheduled appointments
      - Archive department data
      - Update hospital directory
      
      **Use Cases:**
      - Remove obsolete departments
      - Hospital restructuring
      - Merge departments
      - Delete test/demo data
      
      **Best Practice:**
      - Use isActive: false to deactivate instead of deletion
      - Maintain department history for reporting
      - Consider soft-delete for data integrity
      
      **Alternative:** Set isActive to false to hide department without losing historical data.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Department MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Department deleted successfully (no content)',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete department with active references',
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
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.departmentService.remove(id);
  }
}
