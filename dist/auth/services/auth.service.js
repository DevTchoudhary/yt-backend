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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../../users/entities/user.entity");
const company_entity_1 = require("../../companies/entities/company.entity");
const email_service_1 = require("../../common/services/email.service");
const validation_service_1 = require("../../common/services/validation.service");
const auth_interface_1 = require("../../common/interfaces/auth.interface");
let AuthService = AuthService_1 = class AuthService {
    userModel;
    companyModel;
    jwtService;
    configService;
    emailService;
    validationService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(userModel, companyModel, jwtService, configService, emailService, validationService) {
        this.userModel = userModel;
        this.companyModel = companyModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.emailService = emailService;
        this.validationService = validationService;
    }
    async signup(signupDto) {
        const { name, email, companyName, companyAlias, businessEmail, backupEmail, phone, businessAddress, timezone = 'UTC', companySize, industry, website, description, } = signupDto;
        if (!this.validationService.isValidBusinessEmail(email)) {
            throw new common_1.BadRequestException('Please use a valid business email address');
        }
        if (!this.validationService.isValidBusinessEmail(businessEmail)) {
            throw new common_1.BadRequestException('Please use a valid business email address for company');
        }
        if (!this.validationService.isValidPhoneNumber(phone)) {
            throw new common_1.BadRequestException('Please provide a valid phone number');
        }
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        let finalAlias = companyAlias;
        if (!finalAlias) {
            finalAlias = this.validationService.generateCompanyAlias(companyName);
        }
        else if (!this.validationService.isValidCompanyAlias(finalAlias)) {
            throw new common_1.BadRequestException('Invalid company alias format');
        }
        const existingCompany = await this.companyModel.findOne({
            $or: [{ name: companyName }, { alias: finalAlias }],
        });
        if (existingCompany) {
            throw new common_1.ConflictException('Company name or alias already exists');
        }
        const company = new this.companyModel({
            name: companyName,
            alias: finalAlias,
            businessEmail,
            backupEmail,
            businessAddress,
            preferredTimezone: timezone,
            status: auth_interface_1.CompanyStatus.PENDING,
            metadata: {
                size: companySize,
                industry,
                website,
                description,
            },
        });
        const savedCompany = await company.save();
        const user = new this.userModel({
            email,
            name,
            role: auth_interface_1.UserRole.CLIENT,
            companyId: savedCompany._id,
            phone,
            timezone,
            status: auth_interface_1.UserStatus.PENDING,
            permissions: auth_interface_1.ROLE_PERMISSIONS[auth_interface_1.UserRole.CLIENT],
        });
        const savedUser = await user.save();
        try {
            await this.emailService.sendWelcomeEmail(email, name, companyName);
        }
        catch (error) {
            this.logger.error('Failed to send welcome email', error);
        }
        this.logger.log(`New user signup: ${email} for company: ${companyName}`);
        return {
            message: 'Signup successful. Your account is pending approval.',
            userId: savedUser._id?.toString() || '',
            companyId: savedCompany._id?.toString() || '',
            requiresApproval: true,
        };
    }
    async login(loginDto, ip, userAgent) {
        const { email } = loginDto;
        const user = await this.userModel.findOne({ email }).populate('companyId');
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === auth_interface_1.UserStatus.INACTIVE || user.status === auth_interface_1.UserStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        if (user.security?.lockUntil && user.security.lockUntil > new Date()) {
            const lockTimeRemaining = Math.ceil((user.security.lockUntil.getTime() - Date.now()) / 60000);
            throw new common_1.UnauthorizedException(`Account is locked. Try again in ${lockTimeRemaining} minutes.`);
        }
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
        if (user.lastOtpRequest && user.lastOtpRequest > fifteenMinutesAgo) {
            if (user.otpRequestCount >= 3) {
                throw new common_1.BadRequestException('Too many OTP requests. Please wait 15 minutes before requesting again.');
            }
        }
        else {
            user.otpRequestCount = 0;
        }
        const otp = this.validationService.generateOtp();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.configService.get('security.otpExpiresInMinutes'));
        user.otp = {
            code: otp,
            expiresAt,
            attempts: 0,
            verified: false,
        };
        user.lastOtpRequest = now;
        user.otpRequestCount = (user.otpRequestCount || 0) + 1;
        user.lastLoginIp = ip;
        user.lastUserAgent = userAgent;
        await user.save();
        try {
            await this.emailService.sendOtpEmail(email, otp, user.name);
        }
        catch (error) {
            this.logger.error('Failed to send OTP email', error);
            throw new common_1.BadRequestException('Failed to send OTP. Please try again.');
        }
        this.logger.log(`OTP sent to ${email}`);
        return {
            message: 'OTP sent to your email',
            otpSent: true,
        };
    }
    async resendOtp(resendOtpDto, ip) {
        const { email } = resendOtpDto;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.status === auth_interface_1.UserStatus.INACTIVE || user.status === auth_interface_1.UserStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        if (user.security?.lockUntil && user.security.lockUntil > new Date()) {
            throw new common_1.UnauthorizedException('Account is temporarily locked');
        }
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        if (user.lastOtpRequest && user.lastOtpRequest > oneHourAgo) {
            if (user.otpRequestCount >= 5) {
                throw new common_1.BadRequestException('Too many OTP requests. Please wait 1 hour before requesting again.');
            }
        }
        else {
            user.otpRequestCount = 0;
        }
        if (user.otp?.expiresAt && user.otp.expiresAt > now) {
            const timeRemaining = Math.ceil((user.otp.expiresAt.getTime() - now.getTime()) / 1000);
            if (timeRemaining > 240) {
                throw new common_1.BadRequestException(`Please wait ${timeRemaining} seconds before requesting a new OTP.`);
            }
        }
        const otp = this.validationService.generateOtp();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.configService.get('security.otpExpiresInMinutes'));
        user.otp = {
            code: otp,
            expiresAt,
            attempts: 0,
            verified: false,
        };
        user.lastOtpRequest = now;
        user.otpRequestCount = (user.otpRequestCount || 0) + 1;
        user.lastLoginIp = ip;
        await user.save();
        try {
            await this.emailService.sendOtpEmail(email, otp, user.name);
        }
        catch (error) {
            this.logger.error('Failed to resend OTP email', error);
            throw new common_1.BadRequestException('Failed to send OTP. Please try again.');
        }
        this.logger.log(`OTP resent to ${email}`);
        return {
            message: 'New OTP sent to your email',
            otpSent: true,
        };
    }
    async verifyOtp(verifyOtpDto) {
        const { email, otp } = verifyOtpDto;
        const user = await this.userModel.findOne({ email }).populate('companyId');
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.otp || user.otp.verified) {
            throw new common_1.BadRequestException('No valid OTP found');
        }
        if (this.validationService.isOtpExpired(user.otp.expiresAt)) {
            throw new common_1.BadRequestException('OTP has expired');
        }
        if (user.otp.attempts >= this.configService.get('security.maxOtpAttempts')) {
            throw new common_1.BadRequestException('Maximum OTP attempts exceeded');
        }
        if (user.otp.code !== otp) {
            user.otp.attempts += 1;
            await user.save();
            throw new common_1.BadRequestException('Invalid OTP');
        }
        user.otp.verified = true;
        user.lastLogin = new Date();
        user.security.loginAttempts = 0;
        user.security.lockUntil = undefined;
        if (!user.emailVerified) {
            user.emailVerified = true;
            user.emailVerifiedAt = new Date();
        }
        await user.save();
        const tokens = await this.generateTokens(user);
        this.logger.log(`User logged in: ${email}`);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
            company: this.sanitizeCompany(user.companyId),
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });
            const user = await this.userModel.findById(payload.sub).populate('companyId');
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const tokens = await this.generateTokens(user);
            return tokens;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async generateTokens(user) {
        const payload = {
            sub: user._id?.toString() || '',
            email: user.email,
            role: user.role,
            companyId: user.companyId.toString(),
            permissions: user.permissions,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.refreshSecret'),
                expiresIn: this.configService.get('jwt.refreshExpiresIn'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
        const { otp, security, ...sanitized } = user.toObject();
        return {
            ...sanitized,
            id: sanitized._id,
        };
    }
    sanitizeCompany(company) {
        if (!company)
            return null;
        const sanitized = company.toObject();
        return {
            ...sanitized,
            id: sanitized._id,
        };
    }
    async inviteUser(inviteUserDto, invitedBy, ip) {
        const { email, name, role, permissions, message } = inviteUserDto;
        const inviteUser = await this.userModel.findOne({ _id: invitedBy._id });
        const now = new Date();
        const otp = this.validationService.generateOtp();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + this.configService.get('security.otpExpiresInMinutes'));
        if (!inviteUser) {
            throw new common_1.BadRequestException('User not found');
        }
        if (inviteUser) {
            console.log(inviteUser);
        }
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        if (!this.validationService.isValidBusinessEmail(email)) {
            throw new common_1.BadRequestException('Please use a valid business email address');
        }
        const invitationToken = this.validationService.generateSecureToken();
        const invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const user = new this.userModel({
            email,
            name,
            role,
            permissions: permissions || [],
            companyId: invitedBy.companyId,
            status: auth_interface_1.UserStatus.PENDING,
            invitationToken,
            invitationExpiry,
            invitedBy: invitedBy._id,
            phone: '',
            timezone: 'UTC',
            otp: {
                code: otp,
                expiresAt,
                attempts: 0,
                verified: false,
            },
            lastOtpRequest: now,
            otpRequestCount: 1,
            lastLoginIp: ip,
        });
        await user.save();
        try {
            await this.emailService.sendInvitationEmail(email, name, invitedBy.name, invitedBy.companyId.name, invitationToken, message, otp);
        }
        catch (error) {
            await this.userModel.findByIdAndDelete(user._id);
            this.logger.error('Failed to send invitation email', error);
            throw new common_1.BadRequestException('Failed to send invitation. Please try again.');
        }
        this.logger.log(`User invitation sent to ${email} by ${invitedBy.email}`);
        return {
            message: 'Invitation sent successfully',
            invitedUser: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
            },
        };
    }
    async resendInvitation(resendInvitationDto, invitedBy) {
        const { email } = resendInvitationDto;
        const user = await this.userModel.findOne({
            email,
            companyId: invitedBy.companyId,
            status: auth_interface_1.UserStatus.PENDING
        });
        if (!user) {
            throw new common_1.BadRequestException('Invitation not found or already accepted');
        }
        if (user.invitationExpiry && user.invitationExpiry < new Date()) {
            user.invitationToken = this.validationService.generateSecureToken();
            user.invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await user.save();
        }
        try {
            await this.emailService.sendInvitationEmail(email, user.name, invitedBy.name, invitedBy.companyId.name, user.invitationToken || '');
        }
        catch (error) {
            this.logger.error('Failed to resend invitation email', error);
            throw new common_1.BadRequestException('Failed to resend invitation. Please try again.');
        }
        this.logger.log(`Invitation resent to ${email} by ${invitedBy.email}`);
        return {
            message: 'Invitation resent successfully',
        };
    }
    async acceptInvitation(acceptInvitationDto) {
        const { token, otp } = acceptInvitationDto;
        const user = await this.userModel.findOne({
            invitationToken: token,
            status: auth_interface_1.UserStatus.PENDING
        }).populate('companyId');
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired invitation token');
        }
        if (user.invitationExpiry && user.invitationExpiry < new Date()) {
            throw new common_1.BadRequestException('Invitation has expired');
        }
        if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        user.status = auth_interface_1.UserStatus.ACTIVE;
        user.invitationToken = undefined;
        user.invitationExpiry = undefined;
        user.invitationAcceptedAt = new Date();
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        user.otp.verified = true;
        await user.save();
        const tokens = await this.generateTokens(user);
        this.logger.log(`User accepted invitation: ${user.email}`);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
            company: this.sanitizeCompany(user.companyId),
            message: 'Invitation accepted successfully',
        };
    }
    async updateUser(userId, updateUserDto, updatedBy) {
        const user = await this.userModel.findOne({
            _id: userId,
            companyId: new mongoose_2.Types.ObjectId(updatedBy.companyId)
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (updatedBy.role !== auth_interface_1.UserRole.ADMIN && updatedBy.role !== auth_interface_1.UserRole.COMPANY_ADMIN) {
            throw new common_1.ForbiddenException('Insufficient permissions to update user');
        }
        if (user._id?.toString() === updatedBy._id?.toString() && updateUserDto.role && updatedBy.role !== auth_interface_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Cannot modify your own role');
        }
        Object.assign(user, updateUserDto);
        await user.save();
        this.logger.log(`User ${user.email} updated by ${updatedBy.email}`);
        return {
            message: 'User updated successfully',
            user: this.sanitizeUser(user),
        };
    }
    async updateUserStatus(userId, updateUserStatusDto, updatedBy) {
        const { status, reason } = updateUserStatusDto;
        const user = await this.userModel.findOne({
            _id: userId,
            companyId: new mongoose_2.Types.ObjectId(updatedBy.companyId),
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (updatedBy.role !== auth_interface_1.UserRole.ADMIN && updatedBy.role !== auth_interface_1.UserRole.COMPANY_ADMIN) {
            throw new common_1.ForbiddenException('Insufficient permissions to update user status');
        }
        if (user._id?.toString() === updatedBy._id?.toString() && status !== auth_interface_1.UserStatus.ACTIVE) {
            throw new common_1.ForbiddenException('Cannot deactivate your own account');
        }
        user.status = status;
        if (status !== auth_interface_1.UserStatus.ACTIVE) {
            user.deactivationReason = reason;
            user.deactivatedAt = new Date();
            user.deactivatedBy = updatedBy._id;
        }
        else {
            user.deactivationReason = undefined;
            user.deactivatedAt = undefined;
            user.deactivatedBy = undefined;
        }
        await user.save();
        this.logger.log(`User ${user.email} status changed to ${status} by ${updatedBy.email}`);
        return {
            message: `User status updated to ${status}`,
            user: this.sanitizeUser(user),
        };
    }
    async removeUser(userId, removeUserDto, removedBy) {
        const { reason, transferData, transferToUserId } = removeUserDto;
        const user = await this.userModel.findOne({
            _id: userId,
            companyId: removedBy.companyId
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (removedBy.role !== auth_interface_1.UserRole.ADMIN && removedBy.role !== auth_interface_1.UserRole.COMPANY_ADMIN) {
            throw new common_1.ForbiddenException('Insufficient permissions to remove user');
        }
        if (user._id?.toString() === removedBy._id?.toString()) {
            throw new common_1.ForbiddenException('Cannot remove your own account');
        }
        if (transferData && transferToUserId) {
            const transferToUser = await this.userModel.findOne({
                _id: transferToUserId,
                companyId: removedBy.companyId
            });
            if (!transferToUser) {
                throw new common_1.BadRequestException('Transfer target user not found');
            }
            this.logger.log(`Data transfer from ${user.email} to ${transferToUser.email} initiated`);
        }
        user.status = auth_interface_1.UserStatus.INACTIVE;
        user.deactivationReason = reason || 'User removed from company';
        user.deactivatedAt = new Date();
        user.deactivatedBy = removedBy._id;
        await user.save();
        this.logger.log(`User ${user.email} removed by ${removedBy.email}`);
        return {
            message: 'User removed successfully',
            transferInitiated: transferData && transferToUserId,
        };
    }
    async changeEmail(userId, changeEmailDto) {
        const { newEmail, otp } = changeEmailDto;
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        const existingUser = await this.userModel.findOne({ email: newEmail });
        if (existingUser) {
            throw new common_1.ConflictException('Email already in use');
        }
        if (!this.validationService.isValidBusinessEmail(newEmail)) {
            throw new common_1.BadRequestException('Please use a valid business email address');
        }
        user.email = newEmail;
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        user.pendingEmailChange = undefined;
        user.emailChangeToken = undefined;
        user.emailChangeExpiry = undefined;
        user.otp.verified = true;
        await user.save();
        this.logger.log(`User email changed from ${user.email} to ${newEmail}`);
        return {
            message: 'Email changed successfully',
            user: this.sanitizeUser(user),
        };
    }
    async getCompanyUsers(companyId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const filter = { companyId };
        if (status) {
            filter.status = status;
        }
        const [users, total] = await Promise.all([
            this.userModel
                .find(filter)
                .populate('invitedBy', 'name email')
                .populate('deactivatedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.userModel.countDocuments(filter),
        ]);
        return {
            users: users.map(user => this.sanitizeUser(user)),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getUserById(userId) {
        const user = await this.userModel.findById(userId).populate('companyId');
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(company_entity_1.Company.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService,
        validation_service_1.ValidationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map