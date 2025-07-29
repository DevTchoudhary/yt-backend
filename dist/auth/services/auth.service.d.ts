import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../../users/entities/user.entity';
import { CompanyDocument } from '../../companies/entities/company.entity';
import { EmailService } from '../../common/services/email.service';
import { ValidationService } from '../../common/services/validation.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto, VerifyOtpDto, ResendOtpDto, ChangeEmailDto, VerifySignupOtpDto } from '../dto/login.dto';
import { InviteUserDto, AcceptInvitationDto, ResendInvitationDto } from '../dto/invitation.dto';
import { UpdateUserDto, UpdateUserStatusDto, RemoveUserDto } from '../dto/user-management.dto';
import { UserRole, UserStatus, AuthTokens, SanitizedUser, SanitizedCompany } from '../../common/interfaces/auth.interface';
export declare class AuthService {
    private userModel;
    private companyModel;
    private jwtService;
    private configService;
    private emailService;
    private validationService;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, companyModel: Model<CompanyDocument>, jwtService: JwtService, configService: ConfigService, emailService: EmailService, validationService: ValidationService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        userId: string;
        companyId: string;
        otpSent: boolean;
        requiresVerification: boolean;
    }>;
    login(loginDto: LoginDto, ip?: string, userAgent?: string): Promise<{
        message: string;
        otpSent: boolean;
    }>;
    resendOtp(resendOtpDto: ResendOtpDto, ip?: string): Promise<{
        message: string;
        otpSent: boolean;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        user: SanitizedUser;
        company: SanitizedCompany | null;
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    private generateTokens;
    private sanitizeUser;
    private sanitizeCompany;
    inviteUser(inviteUserDto: InviteUserDto, invitedBy: UserDocument): Promise<{
        message: string;
        invitedUser: {
            id: unknown;
            email: string;
            name: string;
            role: UserRole;
            status: UserStatus;
            phone: UserStatus;
        };
    }>;
    resendInvitation(resendInvitationDto: ResendInvitationDto, invitedBy: UserDocument): Promise<{
        message: string;
    }>;
    acceptInvitation(acceptInvitationDto: AcceptInvitationDto): Promise<{
        user: SanitizedUser;
        company: SanitizedCompany | null;
        message: string;
        accessToken: string;
        refreshToken: string;
    }>;
    updateUser(userId: string, updateUserDto: UpdateUserDto, updatedBy: UserDocument): Promise<{
        message: string;
        user: SanitizedUser;
    }>;
    updateUserStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto, updatedBy: UserDocument): Promise<{
        message: string;
        user: SanitizedUser;
    }>;
    removeUser(userId: string, removeUserDto: RemoveUserDto, removedBy: UserDocument): Promise<{
        message: string;
        transferInitiated: string | false | undefined;
    } | undefined>;
    changeEmail(userId: string, changeEmailDto: ChangeEmailDto): Promise<{
        message: string;
        user: SanitizedUser;
    }>;
    getCompanyUsers(companyId: string, page?: number, limit?: number, status?: UserStatus): Promise<{
        users: SanitizedUser[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUserById(userId: string): Promise<UserDocument>;
    verifySignupOtp(verifySignupOtpDto: VerifySignupOtpDto): Promise<{
        user: SanitizedUser;
        company: SanitizedCompany | null;
        message: string;
        accessToken: string;
        refreshToken: string;
    }>;
    verifyToken(token: string): Promise<{
        valid: boolean;
        user: SanitizedUser;
        company: SanitizedCompany | null;
        expiresAt: Date | undefined;
        error?: undefined;
    } | {
        valid: boolean;
        error: string;
        user?: undefined;
        company?: undefined;
        expiresAt?: undefined;
    }>;
    resendSignupOtp(resendOtpDto: ResendOtpDto, ip?: string): Promise<{
        message: string;
        otpSent: boolean;
    }>;
}
