import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../users/entities/user.entity';
import {
  Company,
  CompanyDocument,
} from '../../companies/entities/company.entity';
import { EmailService } from '../../common/services/email.service';
import { ValidationService } from '../../common/services/validation.service';
import { SignupDto } from '../dto/signup.dto';
import {
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  ChangeEmailDto,
} from '../dto/login.dto';
import {
  InviteUserDto,
  AcceptInvitationDto,
  ResendInvitationDto,
} from '../dto/invitation.dto';
import {
  UpdateUserDto,
  UpdateUserStatusDto,
  RemoveUserDto,
} from '../dto/user-management.dto';
import {
  UserRole,
  UserStatus,
  CompanyStatus,
  JwtPayload,
  AuthTokens,
  ROLE_PERMISSIONS,
  SanitizedUser,
  SanitizedCompany,
} from '../../common/interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private validationService: ValidationService,
  ) {}

  async signup(signupDto: SignupDto) {
    const {
      name,
      email,
      companyName,
      companyAlias,
      businessEmail,
      backupEmail,
      phone,
      businessAddress,
      timezone = 'UTC',
      companySize,
      industry,
      website,
      description,
    } = signupDto;

    // Validate business email
    if (!this.validationService.isValidBusinessEmail(email)) {
      throw new BadRequestException(
        'Please use a valid business email address',
      );
    }

    if (
      businessEmail &&
      !this.validationService.isValidBusinessEmail(businessEmail)
    ) {
      throw new BadRequestException(
        'Please use a valid business email address for company',
      );
    }

    // Validate phone number
    if (phone && !this.validationService.isValidPhoneNumber(phone)) {
      throw new BadRequestException('Please provide a valid phone number');
    }

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate or validate company alias
    let finalAlias = companyAlias;
    if (!finalAlias) {
      finalAlias = this.validationService.generateCompanyAlias(companyName);
    } else if (!this.validationService.isValidCompanyAlias(finalAlias)) {
      throw new BadRequestException('Invalid company alias format');
    }

    // Check if company name or alias already exists
    const existingCompany = await this.companyModel.findOne({
      $or: [{ name: companyName }, { alias: finalAlias }],
    });
    if (existingCompany) {
      throw new ConflictException('Company name or alias already exists');
    }

    // Create company
    const company = new this.companyModel({
      name: companyName,
      alias: finalAlias,
      businessEmail: businessEmail || email, // Use user email if businessEmail not provided
      backupEmail,
      businessAddress,
      preferredTimezone: timezone,
      status: CompanyStatus.PENDING,
      metadata: {
        size: companySize,
        industry,
        website,
        description,
      },
    });

    const savedCompany = await company.save();

    // Create user
    const user = new this.userModel({
      email,
      name,
      role: UserRole.CLIENT,
      companyId: savedCompany._id,
      phone,
      timezone,
      status: UserStatus.PENDING,
      permissions: ROLE_PERMISSIONS[UserRole.CLIENT],
    });

    const savedUser = await user.save();

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(email, name, companyName);
    } catch (error) {
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

  async login(loginDto: LoginDto, ip?: string, userAgent?: string) {
    const { email } = loginDto;

    const user = await this.userModel.findOne({ email }).populate('companyId');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (
      user.status === UserStatus.INACTIVE ||
      user.status === UserStatus.SUSPENDED
    ) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Check if account is locked
    if (user.security?.lockUntil && user.security.lockUntil > new Date()) {
      const lockTimeRemaining = Math.ceil(
        (user.security.lockUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${lockTimeRemaining} minutes.`,
      );
    }

    // Check OTP rate limiting (max 3 requests per 15 minutes)
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    if (user.lastOtpRequest && user.lastOtpRequest > fifteenMinutesAgo) {
      if (user.otpRequestCount >= 3) {
        throw new BadRequestException(
          'Too many OTP requests. Please wait 15 minutes before requesting again.',
        );
      }
    } else {
      // Reset counter if 15 minutes have passed
      user.otpRequestCount = 0;
    }

    // Generate and send OTP
    const otp = this.validationService.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() +
        Number(this.configService.get('security.otpExpiresInMinutes')),
    );

    user.otp = {
      code: otp,
      expiresAt,
      attempts: 0,
      verified: false,
    };

    // Update rate limiting and session info
    user.lastOtpRequest = now;
    user.otpRequestCount = (user.otpRequestCount || 0) + 1;
    user.lastLoginIp = ip;
    user.lastUserAgent = userAgent;

    await user.save();

    // Send OTP email
    try {
      await this.emailService.sendOtpEmail(email, otp, user.name);
    } catch (error) {
      this.logger.error('Failed to send OTP email', error);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    this.logger.log(`OTP sent to ${email}`);

    return {
      message: 'OTP sent to your email',
      otpSent: true,
    };
  }

  async resendOtp(resendOtpDto: ResendOtpDto, ip?: string) {
    const { email } = resendOtpDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      user.status === UserStatus.INACTIVE ||
      user.status === UserStatus.SUSPENDED
    ) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Check if account is locked
    if (user.security?.lockUntil && user.security.lockUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    // Check rate limiting (max 5 resend requests per hour)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (user.lastOtpRequest && user.lastOtpRequest > oneHourAgo) {
      if (user.otpRequestCount >= 5) {
        throw new BadRequestException(
          'Too many OTP requests. Please wait 1 hour before requesting again.',
        );
      }
    } else {
      user.otpRequestCount = 0;
    }

    // Check if previous OTP is still valid (prevent spam)
    if (user.otp?.expiresAt && user.otp.expiresAt > now) {
      const timeRemaining = Math.ceil(
        (user.otp.expiresAt.getTime() - now.getTime()) / 1000,
      );
      if (timeRemaining > 240) {
        // Only allow resend if less than 4 minutes remaining
        throw new BadRequestException(
          `Please wait ${timeRemaining} seconds before requesting a new OTP.`,
        );
      }
    }

    // Generate new OTP
    const otp = this.validationService.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() +
        Number(this.configService.get('security.otpExpiresInMinutes')),
    );

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

    // Send OTP
    try {
      await this.emailService.sendOtpEmail(email, otp, user.name);
    } catch (error) {
      this.logger.error('Failed to resend OTP email', error);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    this.logger.log(`OTP resent to ${email}`);

    return {
      message: 'New OTP sent to your email',
      otpSent: true,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const user = await this.userModel.findOne({ email }).populate('companyId');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.otp || user.otp.verified) {
      throw new BadRequestException('No valid OTP found');
    }

    if (this.validationService.isOtpExpired(user.otp.expiresAt)) {
      throw new BadRequestException('OTP has expired');
    }

    if (
      user.otp.attempts >= this.configService.get('security.maxOtpAttempts')
    ) {
      throw new BadRequestException('Maximum OTP attempts exceeded');
    }

    if (user.otp.code !== otp) {
      user.otp.attempts += 1;
      await user.save();
      throw new BadRequestException('Invalid OTP');
    }

    // Mark OTP as verified
    user.otp.verified = true;
    user.lastLogin = new Date();
    user.security.loginAttempts = 0;
    user.security.lockUntil = undefined;

    if (!user.emailVerified) {
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
    }

    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`User logged in: ${email}`);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
      company: this.sanitizeCompany(
        user.companyId as unknown as CompanyDocument,
      ),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const rawPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      }) as unknown;
      const payload = rawPayload as JwtPayload;

      const user = await this.userModel
        .findById(payload.sub)
        .populate('companyId');
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: JwtPayload = {
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

  private sanitizeUser(user: UserDocument): SanitizedUser {
    const userObj = user.toObject() as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { otp, security, ...sanitized } = userObj;
    return {
      ...sanitized,
      id: (userObj._id as Types.ObjectId).toString(),
      companyId: (userObj.companyId as Types.ObjectId).toString(),
    } as SanitizedUser;
  }

  private sanitizeCompany(
    company: CompanyDocument | null,
  ): SanitizedCompany | null {
    if (!company) return null;

    const companyObj = company.toObject() as Record<string, unknown>;
    return {
      ...companyObj,
      id: (companyObj._id as Types.ObjectId).toString(),
    } as SanitizedCompany;
  }

  // User Invitation Methods
  async inviteUser(inviteUserDto: InviteUserDto, invitedBy: UserDocument) {
    const { email, name, role, permissions, message, phone } = inviteUserDto;
    const inviteUser = await this.userModel.findOne({ _id: invitedBy._id });
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() +
        Number(this.configService.get('security.otpExpiresInMinutes')),
    );

    if (!inviteUser) {
      throw new BadRequestException('User not found');
    }

    // if(inviteUser.status !== UserStatus.ACTIVE){
    //   throw new BadRequestException('User is not active')
    // }

    if (inviteUser) {
      console.log(inviteUser);
    }

    // ✅ Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // ✅ Validate email
    if (!this.validationService.isValidBusinessEmail(email)) {
      throw new BadRequestException(
        'Please use a valid business email address',
      );
    }

    // ✅ Generate invitation token
    const invitationToken = this.validationService.generateSecureToken();
    const invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const user = new this.userModel({
      email,
      name,
      role,
      permissions: permissions || [],
      companyId: invitedBy.companyId,
      status: UserStatus.PENDING,
      invitationToken,
      invitationExpiry,
      invitedBy: invitedBy._id,
      phone,
      timezone: 'UTC',
    });

    await user.save();

    // ✅ Send invitation email
    try {
      const company = invitedBy.companyId as unknown as CompanyDocument;
      await this.emailService.sendInvitationEmail(
        email,
        name,
        invitedBy.name,
        company.name,
        invitationToken,
        message,
      );
    } catch (error) {
      await this.userModel.findByIdAndDelete(user._id);
      this.logger.error('Failed to send invitation email', error);
      throw new BadRequestException(
        'Failed to send invitation. Please try again.',
      );
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
        phone: user.status,
      },
    };
  }

  async resendInvitation(
    resendInvitationDto: ResendInvitationDto,
    invitedBy: UserDocument,
  ) {
    const { email } = resendInvitationDto;

    const user = await this.userModel.findOne({
      email,
      companyId: invitedBy.companyId,
      status: UserStatus.PENDING,
    });

    if (!user) {
      throw new BadRequestException('Invitation not found or already accepted');
    }

    // Check if invitation is still valid
    if (user.invitationExpiry && user.invitationExpiry < new Date()) {
      // Generate new token and extend expiry
      user.invitationToken = this.validationService.generateSecureToken();
      user.invitationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await user.save();
    }

    // Resend invitation email
    try {
      const company = invitedBy.companyId as unknown as CompanyDocument;
      await this.emailService.sendInvitationEmail(
        email,
        user.name,
        invitedBy.name,
        company.name,
        user.invitationToken || '',
      );
    } catch (error) {
      this.logger.error('Failed to resend invitation email', error);
      throw new BadRequestException(
        'Failed to resend invitation. Please try again.',
      );
    }

    this.logger.log(`Invitation resent to ${email} by ${invitedBy.email}`);

    return {
      message: 'Invitation resent successfully',
    };
  }

  async acceptInvitation(acceptInvitationDto: AcceptInvitationDto) {
    const { token, otp } = acceptInvitationDto;

    const user = await this.userModel
      .findOne({
        invitationToken: token,
        status: UserStatus.PENDING,
      })
      .populate('companyId');

    if (!user) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    // Check if invitation is expired
    if (user.invitationExpiry && user.invitationExpiry < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Verify OTP
    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Activate user
    user.status = UserStatus.ACTIVE;
    user.invitationToken = undefined;
    user.invitationExpiry = undefined;
    user.invitationAcceptedAt = new Date();
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.otp.verified = true;

    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    this.logger.log(`User accepted invitation: ${user.email}`);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
      company: this.sanitizeCompany(
        user.companyId as unknown as CompanyDocument,
      ),
      message: 'Invitation accepted successfully',
    };
  }

  // User Management Methods
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    updatedBy: UserDocument,
  ) {
    const user = await this.userModel.findOne({
      _id: userId,
      companyId: new Types.ObjectId(updatedBy.companyId.toString()),
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check permissions - only company admin or admin can update users
    if (
      updatedBy.role !== UserRole.ADMIN &&
      updatedBy.role !== UserRole.COMPANY_ADMIN
    ) {
      throw new ForbiddenException('Insufficient permissions to update user');
    }

    // Prevent self-role modification unless admin
    if (
      user._id?.toString() === updatedBy._id?.toString() &&
      updateUserDto.role &&
      updatedBy.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Cannot modify your own role');
    }

    Object.assign(user, updateUserDto);
    await user.save();

    this.logger.log(`User ${user.email} updated by ${updatedBy.email}`);

    return {
      message: 'User updated successfully',
      user: this.sanitizeUser(user),
    };
  }

  async updateUserStatus(
    userId: string,
    updateUserStatusDto: UpdateUserStatusDto,
    updatedBy: UserDocument,
  ) {
    const { status, reason } = updateUserStatusDto;

    const user = await this.userModel.findOne({
      _id: userId,
      companyId: new Types.ObjectId(updatedBy.companyId.toString()),
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check permissions
    if (
      updatedBy.role !== UserRole.ADMIN &&
      updatedBy.role !== UserRole.COMPANY_ADMIN
    ) {
      throw new ForbiddenException(
        'Insufficient permissions to update user status',
      );
    }

    // Prevent self-deactivation
    if (
      user._id?.toString() === updatedBy._id?.toString() &&
      status !== UserStatus.ACTIVE
    ) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    user.status = status;
    if (status !== UserStatus.ACTIVE) {
      user.deactivationReason = reason;
      user.deactivatedAt = new Date();
      user.deactivatedBy = updatedBy._id as Types.ObjectId;
    } else {
      user.deactivationReason = undefined;
      user.deactivatedAt = undefined;
      user.deactivatedBy = undefined;
    }

    await user.save();

    this.logger.log(
      `User ${user.email} status changed to ${status} by ${updatedBy.email}`,
    );

    return {
      message: `User status updated to ${status}`,
      user: this.sanitizeUser(user),
    };
  }

  async removeUser(
    userId: string,
    removeUserDto: RemoveUserDto,
    removedBy: UserDocument,
  ) {
    const { reason, transferData, transferToUserId } = removeUserDto;

    try {
      const user = await this.userModel.findOne({
        _id: userId,
        companyId: new Types.ObjectId(removedBy.companyId.toString()),
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check permissions
      if (
        removedBy.role !== UserRole.ADMIN &&
        removedBy.role !== UserRole.COMPANY_ADMIN
      ) {
        throw new ForbiddenException('Insufficient permissions to remove user');
      }

      // Prevent self-removal
      if (user._id?.toString() === removedBy._id?.toString()) {
        throw new ForbiddenException('Cannot remove your own account');
      }

      if (transferData && transferToUserId) {
        const transferToUser = await this.userModel.findOne({
          _id: transferToUserId,
          companyId: removedBy.companyId,
        });

        if (!transferToUser) {
          throw new BadRequestException('Transfer target user not found');
        }

        // Here you would implement data transfer logic
        // This depends on your specific data models
        this.logger.log(
          `Data transfer from ${user.email} to ${transferToUser.email} initiated`,
        );
      }

      // Soft delete - mark as inactive instead of hard delete
      user.status = UserStatus.INACTIVE;
      user.deactivationReason = reason || 'User removed from company';
      user.deactivatedAt = new Date();
      user.deactivatedBy = removedBy._id as Types.ObjectId;

      await user.save();

      this.logger.log(`User ${user.email} removed by ${removedBy.email}`);

      return {
        message: 'User removed successfully',
        transferInitiated: transferData && transferToUserId,
      };
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }

  async changeEmail(userId: string, changeEmailDto: ChangeEmailDto) {
    const { newEmail, otp } = changeEmailDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify OTP
    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if new email is already in use
    const existingUser = await this.userModel.findOne({ email: newEmail });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Validate new email
    if (!this.validationService.isValidBusinessEmail(newEmail)) {
      throw new BadRequestException(
        'Please use a valid business email address',
      );
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

  async getCompanyUsers(
    companyId: string,
    page = 1,
    limit = 10,
    status?: UserStatus,
  ) {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { companyId };

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
      users: users.map((user) => this.sanitizeUser(user)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).populate('companyId');
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}
