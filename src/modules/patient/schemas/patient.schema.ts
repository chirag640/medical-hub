import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Schema as MongooseSchema } from 'mongoose';

export type PatientDocument = Patient & MongooseDocument;

@Schema({ timestamps: true })
export class Patient {
  // Universal Patient ID (auto-generated)
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  patientId!: string; // e.g., "PAT-1732567890123"

  // Basic Information
  @Prop({
    type: String,
    required: false, // Optional for migrant workers without email
    sparse: true, // Allows null values while maintaining uniqueness
    index: true,
  })
  email?: string;

  @Prop({
    type: String,
    required: true,
  })
  firstName!: string;

  @Prop({
    type: String,
    required: true,
  })
  lastName!: string;

  @Prop({
    type: String,
    required: true,
    index: true,
  })
  fullName!: string; // Computed: firstName + lastName

  @Prop({
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'],
  })
  gender!: string;

  @Prop({
    type: Date,
    required: true,
    index: true,
  })
  dateOfBirth!: Date;

  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  phone!: string;

  @Prop({
    type: String,
    required: false,
  })
  address!: string; // Current residential address

  // India-Specific Identification (Migrant Workers)
  @Prop({
    type: String,
    required: false,
    sparse: true,
    unique: true,
    index: true,
  })
  aadhaarNumber?: string; // Encrypted - 12 digit Aadhaar

  @Prop({
    type: String,
    required: false,
  })
  nativeState?: string;

  @Prop({
    type: String,
    required: false,
  })
  nativeDistrict?: string;

  // Identification Numbers (All Optional - Different Countries)
  @Prop({
    type: String,
    required: false,
    sparse: true,
    unique: true,
  })
  ssn?: string; // USA

  @Prop({
    type: String,
    required: false,
  })
  insuranceNumber?: string;

  @Prop({
    type: String,
    required: false,
    sparse: true,
  })
  passportNumber?: string; // International

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: false,
  })
  emergencyContact?: Record<string, any>;

  // Medical Information (ENCRYPTED fields marked with _encrypted suffix in DB)
  @Prop({
    type: String,
    required: false,
  })
  medicalHistory?: string; // Will be encrypted

  @Prop({
    type: [String],
    required: false,
  })
  allergies?: string[]; // Will be encrypted

  @Prop({
    type: [String],
    required: false,
  })
  currentMedication?: string[]; // Will be encrypted

  @Prop({
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown',
  })
  bloodType!: string;

  // QR Code for Quick Access
  @Prop({
    type: String,
    required: false,
    index: true,
  })
  qrCodeData?: string; // Base64 QR code image

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: false,
  })
  qrCodePayload?: Record<string, any>; // { id, type, name, bloodType, phone }

  // Profile Image
  @Prop({
    type: String,
    required: false,
  })
  profileImage?: string; // URL or base64

  // Consent & Privacy
  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  consentGiven!: boolean; // HIPAA/GDPR consent

  @Prop({
    type: Date,
    required: false,
  })
  consentDate?: Date;

  // Multi-Tenant Support
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false,
    index: true,
  })
  tenantId?: string; // Hospital/Clinic ID

  // Status & Soft Delete
  @Prop({
    type: Boolean,
    required: false,
    default: true,
  })
  isActive!: boolean;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
    index: true,
  })
  isDeleted!: boolean;

  @Prop({
    type: Date,
    required: false,
  })
  deletedAt?: Date;

  @Prop({
    type: String,
    required: false,
  })
  deletedBy?: string; // User ID who deleted

  @Prop({
    type: String,
    required: false,
  })
  deletionReason?: string;

  // Encrypted Data Keys (for field-level encryption)
  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: false,
    select: false, // Don't return in queries by default
  })
  _encrypted?: Record<string, any>;

  @Prop({
    type: Buffer,
    required: false,
    select: false,
  })
  _encryptedDek?: Buffer;

  // Audit Fields
  @Prop({
    type: String,
    required: false,
  })
  createdBy?: string; // User ID who created

  @Prop({
    type: String,
    required: false,
  })
  lastModifiedBy?: string; // User ID who last updated
}

export const PatientSchema = SchemaFactory.createForClass(Patient);

// Compound indexes for common query patterns
// Creation date sorting
PatientSchema.index({ createdAt: -1 });

// Multi-tenant isolation
PatientSchema.index({ tenantId: 1, isDeleted: 1 });

// Active patients
PatientSchema.index({ isActive: 1, isDeleted: 1 });

// Phone lookup (primary search)
PatientSchema.index({ phone: 1, tenantId: 1 });

// Blood type filtering
PatientSchema.index({ bloodType: 1, tenantId: 1 });

// Native location search
PatientSchema.index({ nativeState: 1, nativeDistrict: 1 });

// Full-text search
PatientSchema.index({ fullName: 'text', phone: 'text' });

// Pre-save hook to compute fullName
PatientSchema.pre('save', function (next) {
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});
