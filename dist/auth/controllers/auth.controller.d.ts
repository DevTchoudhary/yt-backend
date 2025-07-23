import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto, VerifyOtpDto, RefreshTokenDto, ResendOtpDto, ChangeEmailDto } from '../dto/login.dto';
import { InviteUserDto, AcceptInvitationDto, ResendInvitationDto, BulkInviteDto } from '../dto/invitation.dto';
import { UpdateUserDto, UpdateUserStatusDto, RemoveUserDto, UpdateUserRoleDto, BulkUserActionDto } from '../dto/user-management.dto';
import { AuthResponseDto, LoginResponseDto, SignupResponseDto } from '../dto/auth-response.dto';
import { RequestUser } from '../../common/interfaces/auth.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<SignupResponseDto>;
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<import("../../common/interfaces/auth.interface").AuthTokens>;
    getProfile(user: RequestUser): Promise<{
        userId: string;
        email: string;
        role: import("../../common/interfaces/auth.interface").UserRole;
        companyId: string;
        permissions: string[];
    }>;
    logout(user: RequestUser): Promise<{
        message: string;
    }>;
    resendOtp(resendOtpDto: ResendOtpDto, req: any): Promise<{
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
            status: import("../../common/interfaces/auth.interface").UserStatus;
            phone: import("../../common/interfaces/auth.interface").UserStatus;
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
    acceptInvitation(acceptInvitationDto: AcceptInvitationDto): Promise<{
        user: any;
        company: any;
        message: string;
        accessToken: string;
        refreshToken: string;
    }>;
    getCompanyUsers(user: RequestUser, page?: number, limit?: number, status?: string): Promise<{
        users: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    updateUser(userId: string, updateUserDto: UpdateUserDto, user: RequestUser): Promise<{
        message: string;
        user: any;
    }>;
    updateUserStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto, user: RequestUser): Promise<{
        message: string;
        user: any;
    }>;
    updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto, user: RequestUser): Promise<{
        message: string;
        user: any;
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
        user: any;
    }>;
}
