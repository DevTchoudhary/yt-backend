import { Document } from 'mongoose';
import { CompanyStatus } from '../../common/interfaces/auth.interface';
import { BaseEntity } from '../../common/interfaces/base.interface';
export type CompanyDocument = Company & Document;
export declare class Company implements BaseEntity {
    name: string;
    alias: string;
    businessEmail?: string;
    backupEmail?: string;
    businessAddress?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipcode: string;
    };
    preferredTimezone: string;
    status: CompanyStatus;
    subscriptionPlan: string;
    onboardingCompleted: boolean;
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
    metadata: {
        industry?: string;
        size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
        website?: string;
        description?: string;
    };
    approvedAt?: Date;
    approvedBy?: string;
    rejectionReason?: string;
    lastActivityAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const CompanySchema: import("mongoose").Schema<Company, import("mongoose").Model<Company, any, any, any, Document<unknown, any, Company, any> & Company & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Company, Document<unknown, {}, import("mongoose").FlatRecord<Company>, {}> & import("mongoose").FlatRecord<Company> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
