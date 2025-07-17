import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole, UserStatus, Permission, OtpData } from '../../common/interfaces/auth.interface';
import { BaseEntity } from '../../common/interfaces/base.interface';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User implements BaseEntity {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, default: 'UTC' })
  timezone: string;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({
    type: {
      code: { type: String, required: true },
      expiresAt: { type: Date, required: true },
      attempts: { type: Number, default: 0 },
      verified: { type: Boolean, default: false },
    },
    required: false,
  })
  otp?: OtpData;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop({ type: [String], enum: Permission, default: [] })
  permissions: Permission[];

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ type: Date })
  emailVerifiedAt?: Date;

  @Prop({
    type: {
      loginAttempts: { type: Number, default: 0 },
      lockUntil: { type: Date },
    },
    default: {},
  })
  security: {
    loginAttempts: number;
    lockUntil?: Date;
  };

  @Prop({
    type: {
      language: { type: String, default: 'en' },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
    },
    default: {},
  })
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };

  // Invitation fields
  @Prop({ type: String })
  invitationToken?: string;

  @Prop({ type: Date })
  invitationExpiry?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  invitedBy?: Types.ObjectId;

  @Prop({ type: Date })
  invitationAcceptedAt?: Date;

  // Email change fields
  @Prop({ type: String })
  pendingEmailChange?: string;

  @Prop({ type: String })
  emailChangeToken?: string;

  @Prop({ type: Date })
  emailChangeExpiry?: Date;

  // Deactivation fields
  @Prop({ type: String })
  deactivationReason?: string;

  @Prop({ type: Date })
  deactivatedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deactivatedBy?: Types.ObjectId;

  // Session management
  @Prop({ type: [String], default: [] })
  refreshTokens: string[];

  @Prop({ type: String })
  lastLoginIp?: string;

  @Prop({ type: String })
  lastUserAgent?: string;

  // OTP rate limiting
  @Prop({ type: Date })
  lastOtpRequest?: Date;

  @Prop({ type: Number, default: 0 })
  otpRequestCount: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ companyId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for company
UserSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true,
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });