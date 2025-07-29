import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto, VerifyOtpDto, ResendOtpDto, ChangeEmailDto, VerifySignupOtpDto, VerifyTokenDto } from '../dto/login.dto';
import { InviteUserDto, AcceptInvitationDto, ResendInvitationDto, BulkInviteDto } from '../dto/invitation.dto';
import { UpdateUserDto, UpdateUserStatusDto, RemoveUserDto, UpdateUserRoleDto, BulkUserActionDto } from '../dto/user-management.dto';
import { AuthResponseDto, LoginResponseDto, SignupResponseDto } from '../dto/auth-response.dto';
import { RequestUser } from '../../common/interfaces/auth.interface';
import { UserStatus } from '../../common/interfaces/auth.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<SignupResponseDto>;
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
    verifyOtp(verifyOtpDto: VerifyOtpDto, response: Response): Promise<Omit<AuthResponseDto, 'accessToken' | 'refreshToken'>>;
    refreshToken(request: Request, response: Response): Promise<{
        message: string;
    }>;
    logout(response: Response): {
        message: string;
    };
    getProfile(user: RequestUser): {
        userId: string;
        email: string;
        role: import("../../common/interfaces/auth.interface").UserRole;
        companyId: string;
        permissions: string[];
    };
    resendOtp(resendOtpDto: ResendOtpDto, req: Request): Promise<{
        message: string;
        otpSent: boolean;
    }>;
    resendSignupOtp(resendOtpDto: ResendOtpDto, req: Request): Promise<{
        message: string;
        otpSent: boolean;
    }>;
    inviteUser(inviteUserDto: InviteUserDto, user: RequestUser): Promise<{
        message: string;
        invitedUser: {
            id: unknown;
            email: string;
            name: string;
            role: import("../../common/interfaces/auth.interface").UserRole;
            status: UserStatus;
            phone: UserStatus;
        };
    }>;
    bulkInviteUsers(bulkInviteDto: BulkInviteDto, user: RequestUser): Promise<{
        message: string;
        results: {
            email: string;
            success: boolean;
            result?: any;
            error?: string;
        }[];
        successful: number;
        failed: number;
    }>;
    resendInvitation(resendInvitationDto: ResendInvitationDto, user: RequestUser): Promise<{
        message: string;
    }>;
    acceptInvitation(acceptInvitationDto: AcceptInvitationDto, response: Response): Promise<Omit<AuthResponseDto, 'accessToken' | 'refreshToken'>>;
    verifySignupOtp(verifySignupOtpDto: VerifySignupOtpDto, response: Response): Promise<Omit<AuthResponseDto, 'accessToken' | 'refreshToken'>>;
    getCompanyUsers(user: RequestUser, page?: number, limit?: number, status?: string): Promise<{
        users: import("../../common/interfaces/auth.interface").SanitizedUser[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    updateUser(userId: string, updateUserDto: UpdateUserDto, user: RequestUser): Promise<{
        message: string;
        user: import("../../common/interfaces/auth.interface").SanitizedUser;
    }>;
    updateUserStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto, user: RequestUser): Promise<{
        message: string;
        user: import("../../common/interfaces/auth.interface").SanitizedUser;
    }>;
    updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto, user: RequestUser): Promise<{
        message: string;
        user: import("../../common/interfaces/auth.interface").SanitizedUser;
    }>;
    removeUser(userId: string, removeUserDto: RemoveUserDto, user: RequestUser): Promise<{
        message: string;
        transferInitiated: string | false | undefined;
    } | undefined>;
    bulkUserAction(bulkUserActionDto: BulkUserActionDto, user: RequestUser): Promise<{
        message: string;
        results: {
            userId: string;
            success: boolean;
            result?: any;
            error?: string;
        }[];
        successful: number;
        failed: number;
    }>;
    changeEmail(changeEmailDto: ChangeEmailDto, user: RequestUser): Promise<{
        message: string;
        user: import("../../common/interfaces/auth.interface").SanitizedUser;
    }>;
    verifyToken(verifyTokenDto: VerifyTokenDto): Promise<{
        valid: boolean;
        user: import("../../common/interfaces/auth.interface").SanitizedUser;
        company: import("../../common/interfaces/auth.interface").SanitizedCompany | null;
        expiresAt: Date | undefined;
        error?: undefined;
    } | {
        valid: boolean;
        error: string;
        user?: undefined;
        company?: undefined;
        expiresAt?: undefined;
    }>;
}
