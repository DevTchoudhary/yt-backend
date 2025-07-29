import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto, VerifyOtpDto, RefreshTokenDto, ResendOtpDto, ChangeEmailDto } from '../dto/login.dto';
import { InviteUserDto, AcceptInvitationDto, ResendInvitationDto, BulkInviteDto } from '../dto/invitation.dto';
import { UpdateUserDto, UpdateUserStatusDto, RemoveUserDto, UpdateUserRoleDto, BulkUserActionDto } from '../dto/user-management.dto';
import { AuthResponseDto, LoginResponseDto, SignupResponseDto, UserResponseDto, BulkInviteResponseDto, BulkActionResponseDto } from '../dto/auth-response.dto';
import { RequestUser, UserStatus } from '../../common/interfaces/auth.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<SignupResponseDto>;
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto>;
    getProfile(user: RequestUser): Promise<UserResponseDto>;
    logout(): {
        message: string;
    };
    resendOtp(resendOtpDto: ResendOtpDto, req: Request): Promise<{
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
    bulkInviteUsers(bulkInviteDto: BulkInviteDto, user: RequestUser): Promise<BulkInviteResponseDto>;
    resendInvitation(resendInvitationDto: ResendInvitationDto, user: RequestUser): Promise<{
        message: string;
    }>;
    acceptInvitation(acceptInvitationDto: AcceptInvitationDto): Promise<{
        user: UserResponseDto;
        company: any;
        message: string;
        accessToken: string;
        refreshToken: string;
    }>;
    getCompanyUsers(user: RequestUser, page?: number, limit?: number, status?: UserStatus): Promise<{
        data: UserResponseDto[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    updateUser(userId: string, updateUserDto: UpdateUserDto, user: RequestUser): Promise<{
        message: string;
        user: UserResponseDto;
    }>;
    updateUserStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto, user: RequestUser): Promise<{
        message: string;
        user: UserResponseDto;
    }>;
    updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto, user: RequestUser): Promise<{
        message: string;
        user: UserResponseDto;
    }>;
    removeUser(userId: string, removeUserDto: RemoveUserDto, user: RequestUser): Promise<{
        message: string;
        transferInitiated: boolean;
    }>;
    bulkUserAction(bulkUserActionDto: BulkUserActionDto, user: RequestUser): Promise<BulkActionResponseDto>;
    changeEmail(changeEmailDto: ChangeEmailDto, user: RequestUser): Promise<{
        message: string;
        user: UserResponseDto;
    }>;
}
