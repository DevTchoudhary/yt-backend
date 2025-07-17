import { Document, Types } from 'mongoose';
import { UserRole, UserStatus, Permission, OtpData } from '../../common/interfaces/auth.interface';
import { BaseEntity } from '../../common/interfaces/base.interface';
export type UserDocument = User & Document;
export declare class User implements BaseEntity {
    email: string;
    name: string;
    role: UserRole;
    companyId: Types.ObjectId;
    phone: string;
    timezone: string;
    status: UserStatus;
    lastLogin?: Date;
    otp?: OtpData;
    twoFactorEnabled: boolean;
    permissions: Permission[];
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    security: {
        loginAttempts: number;
        lockUntil?: Date;
    };
    preferences: {
        language: string;
        notifications: {
            email: boolean;
            sms: boolean;
            push: boolean;
        };
    };
    invitationToken?: string;
    invitationExpiry?: Date;
    invitedBy?: Types.ObjectId;
    invitationAcceptedAt?: Date;
    pendingEmailChange?: string;
    emailChangeToken?: string;
    emailChangeExpiry?: Date;
    deactivationReason?: string;
    deactivatedAt?: Date;
    deactivatedBy?: Types.ObjectId;
    refreshTokens: string[];
    lastLoginIp?: string;
    lastUserAgent?: string;
    lastOtpRequest?: Date;
    otpRequestCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
