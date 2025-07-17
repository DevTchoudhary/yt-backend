import { UserRole, UserStatus, CompanyStatus } from '../../common/interfaces/auth.interface';
export declare class UserResponseDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    companyId: string;
    phone: string;
    timezone: string;
    status: UserStatus;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CompanyResponseDto {
    id: string;
    name: string;
    alias: string;
    businessEmail: string;
    status: CompanyStatus;
    subscriptionPlan: string;
    onboardingCompleted: boolean;
    dashboardUrl: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
    company: CompanyResponseDto;
}
export declare class LoginResponseDto {
    message: string;
    otpSent: boolean;
}
export declare class SignupResponseDto {
    message: string;
    userId: string;
    companyId: string;
    requiresApproval: boolean;
}
