export enum UserRole {
  CLIENT = 'client',
  USER = 'user',
  SRE = 'sre',
  COMPANY_ADMIN = 'company_admin',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum CompanyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
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

export enum Permission {
  // User permissions
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  
  // Company permissions
  COMPANY_READ = 'company:read',
  COMPANY_WRITE = 'company:write',
  COMPANY_DELETE = 'company:delete',
  COMPANY_APPROVE = 'company:approve',
  
  // Project permissions
  PROJECT_READ = 'project:read',
  PROJECT_WRITE = 'project:write',
  PROJECT_DELETE = 'project:delete',
  PROJECT_ASSIGN = 'project:assign',
  
  // Admin permissions
  ADMIN_DASHBOARD = 'admin:dashboard',
  ADMIN_USERS = 'admin:users',
  ADMIN_COMPANIES = 'admin:companies',
  ADMIN_SETTINGS = 'admin:settings',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CLIENT]: [
    Permission.USER_READ,
    Permission.COMPANY_READ,
    Permission.PROJECT_READ,
  ],
  [UserRole.USER]: [
    Permission.USER_READ,
    Permission.COMPANY_READ,
    Permission.PROJECT_READ,
  ],
  [UserRole.SRE]: [
    Permission.USER_READ,
    Permission.COMPANY_READ,
    Permission.PROJECT_READ,
    Permission.PROJECT_WRITE,
  ],
  [UserRole.COMPANY_ADMIN]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_DELETE,
    Permission.COMPANY_READ,
    Permission.COMPANY_WRITE,
    Permission.PROJECT_READ,
    Permission.PROJECT_WRITE,
    Permission.PROJECT_DELETE,
  ],
  [UserRole.ADMIN]: Object.values(Permission),
};