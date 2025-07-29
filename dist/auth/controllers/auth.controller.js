"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("../services/auth.service");
const signup_dto_1 = require("../dto/signup.dto");
const login_dto_1 = require("../dto/login.dto");
const invitation_dto_1 = require("../dto/invitation.dto");
const user_management_dto_1 = require("../dto/user-management.dto");
const auth_response_dto_1 = require("../dto/auth-response.dto");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const auth_interface_1 = require("../../common/interfaces/auth.interface");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async signup(signupDto) {
        return this.authService.signup(signupDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async verifyOtp(verifyOtpDto, response) {
        const result = await this.authService.verifyOtp(verifyOtpDto);
        response.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const { accessToken, refreshToken, ...responseWithoutTokens } = result;
        return responseWithoutTokens;
    }
    async refreshToken(request, response) {
        const refreshToken = request.cookies
            ?.refreshToken;
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token not found');
        }
        const result = await this.authService.refreshToken(refreshToken);
        response.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { message: 'Tokens refreshed successfully' };
    }
    logout(response) {
        response.clearCookie('accessToken');
        response.clearCookie('refreshToken');
        return { message: 'Logged out successfully' };
    }
    getProfile(user) {
        return {
            userId: user.userId,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            permissions: user.permissions,
        };
    }
    async resendOtp(resendOtpDto, req) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        return this.authService.resendOtp(resendOtpDto, ip);
    }
    async resendSignupOtp(resendOtpDto, req) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        return this.authService.resendSignupOtp(resendOtpDto, ip);
    }
    async inviteUser(inviteUserDto, user) {
        const currentUser = await this.authService.getUserById(user.userId);
        return this.authService.inviteUser(inviteUserDto, currentUser);
    }
    async bulkInviteUsers(bulkInviteDto, user) {
        const currentUser = await this.authService.getUserById(user.userId);
        const results = [];
        for (const invitation of bulkInviteDto.invitations) {
            try {
                const result = await this.authService.inviteUser(invitation, currentUser);
                results.push({ email: invitation.email, success: true, result });
            }
            catch (error) {
                const errMsg = error instanceof Error ? error.message : 'Unknown error';
                results.push({
                    email: invitation.email,
                    success: false,
                    error: errMsg,
                });
            }
        }
        return {
            message: 'Bulk invitation completed',
            results,
            successful: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
        };
    }
    async resendInvitation(resendInvitationDto, user) {
        const currentUser = await this.authService.getUserById(user.userId);
        return this.authService.resendInvitation(resendInvitationDto, currentUser);
    }
    async acceptInvitation(acceptInvitationDto, response) {
        const result = await this.authService.acceptInvitation(acceptInvitationDto);
        response.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const { accessToken, refreshToken, ...responseWithoutTokens } = result;
        return responseWithoutTokens;
    }
    async verifySignupOtp(verifySignupOtpDto, response) {
        const result = await this.authService.verifySignupOtp(verifySignupOtpDto);
        response.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        response.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const { accessToken, refreshToken, ...responseWithoutTokens } = result;
        return responseWithoutTokens;
    }
    async getCompanyUsers(user, page = 1, limit = 10, status) {
        return this.authService.getCompanyUsers(user.companyId, Number(page), Number(limit), status);
    }
    async updateUser(userId, updateUserDto, user) {
        const currentUser = await this.authService.getUserById(user.userId);
        const result = await this.authService.updateUser(userId, updateUserDto, currentUser);
        return result;
    }
    async updateUserStatus(userId, updateUserStatusDto, user) {
        const currentUser = await this.authService.getUserById(user.userId);
        return this.authService.updateUserStatus(userId, updateUserStatusDto, currentUser);
    }
    async updateUserRole(userId, updateUserRoleDto, user) {
        const currentUser = await this.authService.getUserById(user.userId);
        const result = await this.authService.updateUser(userId, updateUserRoleDto, currentUser);
        return result;
    }
    async removeUser(userId, removeUserDto, user) {
        const currentUser = await this.authService.getUserById(user.userId);
        return this.authService.removeUser(userId, removeUserDto, currentUser);
    }
    async bulkUserAction(bulkUserActionDto, user) {
        const currentUser = await this.authService.getUserById(user.userId);
        const { userIds, action, reason } = bulkUserActionDto;
        const results = [];
        for (const userId of userIds) {
            try {
                let result;
                switch (action) {
                    case 'activate':
                        result = await this.authService.updateUserStatus(userId, { status: auth_interface_1.UserStatus.ACTIVE }, currentUser);
                        break;
                    case 'deactivate':
                        result = await this.authService.updateUserStatus(userId, { status: auth_interface_1.UserStatus.INACTIVE, reason }, currentUser);
                        break;
                    case 'suspend':
                        result = await this.authService.updateUserStatus(userId, { status: auth_interface_1.UserStatus.SUSPENDED, reason }, currentUser);
                        break;
                    case 'delete':
                        result = await this.authService.removeUser(userId, { userId, reason }, currentUser);
                        break;
                }
                results.push({ userId, success: true, result: result ?? null });
            }
            catch (error) {
                const errMsg = error instanceof Error ? error.message : 'Unknown error';
                results.push({ userId, success: false, error: errMsg });
            }
        }
        return {
            message: 'Bulk action completed',
            results,
            successful: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
        };
    }
    async changeEmail(changeEmailDto, user) {
        const result = await this.authService.changeEmail(user.userId, changeEmailDto);
        return result;
    }
    async verifyToken(verifyTokenDto) {
        const result = await this.authService.verifyToken(verifyTokenDto.token);
        return result;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, auth_decorator_1.Public)(),
    (0, common_1.Post)('signup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user and company' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User and company created successfully',
        type: auth_response_dto_1.SignupResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User or company already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, auth_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login user and send OTP' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP sent successfully',
        type: auth_response_dto_1.LoginResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, auth_decorator_1.Public)(),
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP and get access tokens' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP verified successfully',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.VerifyOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, auth_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refreshed successfully',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, auth_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user and clear tokens' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Logged out successfully',
    }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User profile retrieved successfully',
        type: auth_response_dto_1.UserResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('resend-otp'),
    (0, auth_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Resend OTP to user email' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP resent successfully',
        type: auth_response_dto_1.LoginResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.ResendOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Post)('resend-signup-otp'),
    (0, auth_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Resend signup verification OTP' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'OTP resent successfully',
        type: auth_response_dto_1.LoginResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.ResendOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendSignupOtp", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Invite a user to the company' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User invited successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invitation_dto_1.InviteUserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "inviteUser", null);
__decorate([
    (0, common_1.Post)('invite/bulk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Invite multiple users to the company' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Users invited successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invitation_dto_1.BulkInviteDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "bulkInviteUsers", null);
__decorate([
    (0, common_1.Post)('invite/resend'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Resend invitation to a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invitation resent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invitation_dto_1.ResendInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendInvitation", null);
__decorate([
    (0, common_1.Post)('accept-invitation'),
    (0, auth_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Accept invitation and activate account' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation accepted successfully',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid invitation or OTP' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invitation_dto_1.AcceptInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "acceptInvitation", null);
__decorate([
    (0, auth_decorator_1.Public)(),
    (0, common_1.Post)('verify-signup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify signup OTP and activate account' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Account verified and activated successfully',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.VerifySignupOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySignupOtp", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get company users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    __param(0, (0, auth_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCompanyUsers", null);
__decorate([
    (0, common_1.Patch)('users/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update user details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_management_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)('users/:userId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update user status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_management_dto_1.UpdateUserStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Patch)('users/:userId/role'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update user role and permissions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User role updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_management_dto_1.UpdateUserRoleDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Delete)('users/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remove user from company' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_management_dto_1.RemoveUserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "removeUser", null);
__decorate([
    (0, common_1.Post)('users/bulk-action'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Perform bulk action on users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk action completed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_management_dto_1.BulkUserActionDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "bulkUserAction", null);
__decorate([
    (0, common_1.Post)('change-email'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Change user email address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP or email' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.ChangeEmailDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changeEmail", null);
__decorate([
    (0, auth_decorator_1.Public)(),
    (0, common_1.Post)('verify-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify JWT access token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token verification result',
        type: auth_response_dto_1.TokenVerificationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.VerifyTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map