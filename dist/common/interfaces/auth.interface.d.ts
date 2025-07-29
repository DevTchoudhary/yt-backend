export declare enum UserRole {
    CLIENT = "client",
    USER = "user",
    SRE = "sre",
    COMPANY_ADMIN = "company_admin",
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    SUSPENDED = "suspended"
}
export declare enum CompanyStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    companyId: string;
    permissions: string[];
    iat?: number;
    exp?: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface SanitizedUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    companyId: string;
    phone?: string;
    timezone: string;
    status: UserStatus;
    lastLogin?: Date;
    twoFactorEnabled: boolean;
    permissions: Permission[];
    emailVerified: boolean;
    emailVerifiedAt?: Date;
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
    invitedBy?: string;
    invitationAcceptedAt?: Date;
    pendingEmailChange?: string;
    emailChangeToken?: string;
    emailChangeExpiry?: Date;
    deactivationReason?: string;
    deactivatedAt?: Date;
    deactivatedBy?: string;
    refreshTokens: string[];
    lastLoginIp?: string;
    lastUserAgent?: string;
    lastOtpRequest?: Date;
    otpRequestCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface SanitizedCompany {
    id: string;
    name: string;
    alias: string;
    businessEmail: string;
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
            config: unknown;
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
export interface RequestUser {
    userId: string;
    email: string;
    role: UserRole;
    companyId: string;
    permissions: string[];
}
export interface OtpData {
    code: string;
    expiresAt: Date;
    attempts: number;
    verified: boolean;
}
export declare enum Permission {
    USER_READ = "user:read",
    USER_WRITE = "user:write",
    USER_DELETE = "user:delete",
    COMPANY_READ = "company:read",
    COMPANY_WRITE = "company:write",
    COMPANY_DELETE = "company:delete",
    COMPANY_APPROVE = "company:approve",
    PROJECT_READ = "project:read",
    PROJECT_WRITE = "project:write",
    PROJECT_DELETE = "project:delete",
    PROJECT_ASSIGN = "project:assign",
    ADMIN_DASHBOARD = "admin:dashboard",
    ADMIN_USERS = "admin:users",
    ADMIN_COMPANIES = "admin:companies",
    ADMIN_SETTINGS = "admin:settings"
}
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
