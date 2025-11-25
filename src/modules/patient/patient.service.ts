import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PatientRepository } from './patient.repository';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientOutputDto } from './dto/patient-output.dto';
import { PaginatedResponse, createPaginatedResponse } from '../../pagination.dto';
import { EncryptionService } from '../../common/encryption.service';
import * as QRCode from 'qrcode';

@Injectable()
export class PatientService {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Create patient profile from User account (used during registration)
   * This method is called automatically when a user registers with Patient role
   */
  async createFromUser(
    userId: string,
    userData: { email: string; firstName: string; lastName: string },
  ): Promise<PatientOutputDto> {
    // Check if patient profile already exists for this user
    const existing = await this.patientRepository.findOne({ userId });
    if (existing) {
      return this.mapToOutput(existing);
    }

    // Generate unique patient ID
    const patientId = this.generatePatientId();

    // Create minimal patient profile
    const patientData: any = {
      userId,
      patientId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      gender: 'Other', // Will be updated by user later
      dateOfBirth: new Date('2000-01-01'), // Placeholder - user should update
      phone: '', // To be filled by user
      bloodType: 'Unknown',
      consentGiven: true, // User accepted terms during registration
      consentDate: new Date(),
    };

    // Generate QR code
    const qrPayload = {
      id: patientId,
      name: `${userData.firstName} ${userData.lastName}`,
      phone: '',
      bloodType: 'Unknown',
    };

    patientData.qrCodePayload = qrPayload;
    const QRCode = require('qrcode');
    patientData.qrCodeData = await QRCode.toDataURL(JSON.stringify(qrPayload));

    const created = await this.patientRepository.create(patientData);
    return this.mapToOutput(created);
  }

  async create(dto: CreatePatientDto, createdBy?: string): Promise<PatientOutputDto> {
    // Validate consent
    if (!dto.consentGiven) {
      throw new BadRequestException('Patient consent is required before registration');
    }

    // Generate unique patient ID
    const patientId = this.generatePatientId();

    // Prepare patient data
    const patientData: any = {
      ...dto,
      patientId,
      consentDate: new Date(),
      bloodType: dto.bloodType || 'Unknown', // Default to Unknown if not provided
      createdBy, // Track who created this patient
    };

    // Generate QR code for quick access (contains patient ID for full record lookup)
    const qrPayload = {
      id: patientId,
      name: `${dto.firstName} ${dto.lastName}`,
      phone: dto.phone,
      bloodType: dto.bloodType || 'Unknown',
    };

    patientData.qrCodePayload = qrPayload;
    patientData.qrCodeData = await QRCode.toDataURL(JSON.stringify(qrPayload));

    // Encrypt sensitive fields before storage
    const sensitiveFields = [
      'medicalHistory',
      'allergies',
      'currentMedication',
      'aadhaarNumber',
      'ssn',
    ];
    const encryptedData = await this.encryptionService.encryptRecord(patientData, sensitiveFields);

    const created = await this.patientRepository.create(encryptedData);

    // Decrypt for response
    const decrypted = await this.encryptionService.decryptRecord(created, sensitiveFields);
    return this.mapToOutput(decrypted);
  }

  private generatePatientId(): string {
    const timestamp = Date.now(); // Full timestamp for uniqueness
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `PAT-${timestamp}${random}`; // e.g., PAT-17325678901231234
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedResponse<PatientOutputDto>> {
    // Pagination defaults: page 1, limit 10, max 100
    const currentPage = Math.max(1, Number(page) || 1);
    const itemsPerPage = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (currentPage - 1) * itemsPerPage;

    const [items, total] = await Promise.all([
      this.patientRepository.findAll(skip, itemsPerPage),
      this.patientRepository.count(),
    ]);

    const data = items.map((item) => this.mapToOutput(item));
    return createPaginatedResponse(data, total, currentPage, itemsPerPage);
  }

  async findOne(id: string): Promise<PatientOutputDto> {
    const item = await this.patientRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Decrypt sensitive fields
    const sensitiveFields = [
      'medicalHistory',
      'allergies',
      'currentMedication',
      'aadhaarNumber',
      'ssn',
    ];
    const decrypted = await this.encryptionService.decryptRecord(item, sensitiveFields);

    return this.mapToOutput(decrypted);
  }

  async search(filters: {
    query?: string;
    bloodType?: string;
    nativeState?: string;
    phone?: string;
    tenantId?: string;
    aadhaarNumber?: string;
  }): Promise<PatientOutputDto[]> {
    const searchCriteria: any = {
      isDeleted: { $ne: true },
    };

    if (filters.query) {
      // Full-text search on name and phone
      searchCriteria.$text = { $search: filters.query };
    }

    if (filters.bloodType) {
      searchCriteria.bloodType = filters.bloodType;
    }

    if (filters.nativeState) {
      searchCriteria.nativeState = new RegExp(filters.nativeState, 'i');
    }

    if (filters.phone) {
      searchCriteria.phone = new RegExp(filters.phone);
    }

    if (filters.tenantId) {
      searchCriteria.tenantId = filters.tenantId;
    }

    if (filters.aadhaarNumber) {
      searchCriteria.aadhaarNumber = filters.aadhaarNumber;
    }

    const results = await this.patientRepository.findAll(0, 50, searchCriteria);

    // Decrypt sensitive fields for all results
    const sensitiveFields = [
      'medicalHistory',
      'allergies',
      'currentMedication',
      'aadhaarNumber',
      'ssn',
    ];
    const decrypted = await Promise.all(
      results.map((item) => this.encryptionService.decryptRecord(item, sensitiveFields)),
    );

    return decrypted.map((item) => this.mapToOutput(item));
  }

  async getByPatientId(patientId: string): Promise<PatientOutputDto> {
    const item = await this.patientRepository.findOne({ patientId, isDeleted: { $ne: true } });
    if (!item) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    const sensitiveFields = [
      'medicalHistory',
      'allergies',
      'currentMedication',
      'aadhaarNumber',
      'ssn',
    ];
    const decrypted = await this.encryptionService.decryptRecord(item, sensitiveFields);

    return this.mapToOutput(decrypted);
  }

  async getQRCode(patientId: string): Promise<{ qrCode: string; payload: any }> {
    const patient = await this.patientRepository.findOne({ patientId });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    if (!patient.qrCodeData) {
      throw new NotFoundException(`QR code not found for patient ${patientId}`);
    }

    return {
      qrCode: patient.qrCodeData,
      payload: patient.qrCodePayload || {},
    };
  }

  async update(
    id: string,
    dto: UpdatePatientDto,
    lastModifiedBy?: string,
  ): Promise<PatientOutputDto> {
    const updateData: any = { ...dto };
    if (lastModifiedBy) {
      updateData.lastModifiedBy = lastModifiedBy;
    }
    const updated = await this.patientRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return this.mapToOutput(updated);
  }

  /**
   * Get patient profile by userId (for self-service)
   */
  async getProfileByUserId(userId: string): Promise<PatientOutputDto> {
    const patient = await this.patientRepository.findOne({ userId, isDeleted: { $ne: true } });
    if (!patient) {
      throw new NotFoundException('Patient profile not found. Please complete your profile.');
    }

    // Decrypt sensitive fields
    const sensitiveFields = [
      'medicalHistory',
      'allergies',
      'currentMedication',
      'aadhaarNumber',
      'ssn',
    ];
    const decrypted = await this.encryptionService.decryptRecord(patient, sensitiveFields);

    return this.mapToOutput(decrypted);
  }

  /**
   * Update patient profile by userId (for self-service)
   */
  async updateProfileByUserId(userId: string, dto: UpdatePatientDto): Promise<PatientOutputDto> {
    const patient = await this.patientRepository.findOne({ userId, isDeleted: { $ne: true } });
    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    // Update the profile
    return this.update(patient._id.toString(), dto, userId);
  }

  async remove(id: string, deletedBy?: string): Promise<void> {
    // Soft delete with audit trail
    const updated = await this.patientRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    });
    if (!updated) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
  }

  private mapToOutput(item: any): PatientOutputDto {
    return {
      id: item._id?.toString() || item.id,
      patientId: item.patientId,
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      fullName: item.fullName,
      gender: item.gender,
      dateOfBirth: item.dateOfBirth,
      phone: item.phone,
      address: item.address,
      // Identification
      aadhaarNumber: item.aadhaarNumber ? '****' + item.aadhaarNumber.slice(-4) : undefined, // Masked
      nativeState: item.nativeState,
      nativeDistrict: item.nativeDistrict,
      ssn: item.ssn ? '***-**-' + item.ssn.slice(-4) : undefined, // Masked
      passportNumber: item.passportNumber,
      insuranceNumber: item.insuranceNumber,
      emergencyContact: item.emergencyContact,
      medicalHistory: item.medicalHistory,
      allergies: item.allergies,
      currentMedication: item.currentMedication,
      bloodType: item.bloodType,
      profileImage: item.profileImage,
      qrCodeData: item.qrCodeData,
      consentGiven: item.consentGiven,
      consentDate: item.consentDate,
      tenantId: item.tenantId,
      isActive: item.isActive,
      isDeleted: item.isDeleted,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
