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
import { ApiBearerAuth } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorOutputDto } from './dto/doctor-output.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/rbac/roles.guard';
import { Roles } from '../auth/rbac/roles.decorator';
import { Role } from '../auth/rbac/roles.enum';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateDoctorDto, @Request() req: any): Promise<DoctorOutputDto> {
    return this.doctorService.create(dto, req.user.userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.doctorService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.DOCTOR)
  findOne(@Param('id') id: string): Promise<DoctorOutputDto> {
    return this.doctorService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DOCTOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
    @Request() req: any,
  ): Promise<DoctorOutputDto> {
    return this.doctorService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.doctorService.remove(id, req.user.userId);
  }

  // Doctor self-service endpoints
  @Get('me/profile')
  @Roles(Role.DOCTOR)
  getMyProfile(@Request() req: any): Promise<DoctorOutputDto> {
    return this.doctorService.getProfileByUserId(req.user.userId);
  }

  @Patch('me/profile')
  @Roles(Role.DOCTOR)
  updateMyProfile(@Body() dto: UpdateDoctorDto, @Request() req: any): Promise<DoctorOutputDto> {
    return this.doctorService.updateProfileByUserId(req.user.userId, dto);
  }
}
