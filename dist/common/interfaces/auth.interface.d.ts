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
