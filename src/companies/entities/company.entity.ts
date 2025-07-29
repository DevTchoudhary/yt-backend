import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CompanyStatus } from '../../common/interfaces/auth.interface';
import { BaseEntity } from '../../common/interfaces/base.interface';

export type CompanyDocument = Company & Document;

@Schema({
  timestamps: true,
  collection: 'companies',
})
export class Company implements BaseEntity {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  alias: string;

  @Prop({ required: false, lowercase: true, trim: true })
  businessEmail?: string;

  @Prop({ lowercase: true, trim: true })
  backupEmail?: string;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipcode: { type: String, required: true },
    },
    required: false,
  })
  businessAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };

  @Prop({ required: true, default: 'UTC' })
  preferredTimezone: string;

  @Prop({ required: true, enum: CompanyStatus, default: CompanyStatus.PENDING })
  status: CompanyStatus;

  @Prop({ default: 'basic' })
  subscriptionPlan: string;

  @Prop({ default: false })
  onboardingCompleted: boolean;

  @Prop({
    type: {
      alertChannels: {
        type: [
          {
            type: {
              type: String,
              enum: ['email', 'slack', 'teams', 'webhook', 'sms'],
            },
            config: { type: Object },
            enabled: { type: Boolean, default: true },
          },
        ],
        default: [],
      },
      notificationPreferences: {
        type: {
          incidents: { type: Boolean, default: true },
          maintenance: { type: Boolean, default: true },
          reports: { type: Boolean, default: true },
          security: { type: Boolean, default: true },
        },
        default: {},
      },
      dashboardSettings: {
        type: {
          theme: { type: String, default: 'light' },
          defaultView: { type: String, default: 'overview' },
          autoRefresh: { type: Boolean, default: true },
          refreshInterval: { type: Number, default: 30 }, // seconds
        },
        default: {},
      },
    },
    default: {},
  })
  settings: {
    alertChannels: Array<{
      type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
      config: any;
      enabled: boolean;
    }>;
    notificationPreferences: {
      incidents: boolean;
      maintenance: boolean;
      reports: boolean;
      security: boolean;
    };
    dashboardSettings: {
      theme: string;
      defaultView: string;
      autoRefresh: boolean;
      refreshInterval: number;
    };
  };

  @Prop({
    type: {
      industry: { type: String },
      size: {
        type: String,
        enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
      },
      website: { type: String },
      description: { type: String },
    },
    default: {},
  })
  metadata: {
    industry?: string;
    size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    website?: string;
    description?: string;
  };

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: String })
  approvedBy?: string;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ type: Date })
  lastActivityAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

// Indexes
CompanySchema.index({ name: 1 }, { unique: true });
CompanySchema.index({ alias: 1 }, { unique: true });
CompanySchema.index({ status: 1 });
CompanySchema.index({ createdAt: -1 });
CompanySchema.index({ businessEmail: 1 });

// Virtual for dashboard URL
CompanySchema.virtual('dashboardUrl').get(function () {
  return `${process.env.DASHBOARD_BASE_URL}/${this.alias}`;
});

// Virtual for users
CompanySchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'companyId',
});

// Virtual for projects
CompanySchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'companyId',
});

// Ensure virtual fields are serialized
CompanySchema.set('toJSON', { virtuals: true });
CompanySchema.set('toObject', { virtuals: true });
