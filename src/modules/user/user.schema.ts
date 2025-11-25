import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({
    required: true,
  })
  password!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ type: [String], default: ['User'] })
  roles!: string[];

  @Prop({ type: String, default: null })
  refreshToken!: string | null;

  // Email Verification
  @Prop({ type: Boolean, default: false })
  emailVerified!: boolean;

  @Prop({ type: String, default: null })
  emailVerificationToken!: string | null;

  @Prop({ type: Date, default: null })
  emailVerificationExpiry!: Date | null;

  // Password Reset
  @Prop({ type: String, default: null })
  passwordResetToken!: string | null;

  @Prop({ type: Date, default: null })
  passwordResetExpiry!: Date | null;

  // Account Security
  @Prop({ type: Number, default: 0 })
  failedLoginAttempts!: number;

  @Prop({ type: Date, default: null })
  accountLockedUntil!: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for common queries
// Note: email index with unique:true is already created by @Prop decorator
UserSchema.index({ roles: 1 }); // For role-based queries
UserSchema.index({ createdAt: -1 }); // For sorting by creation date
