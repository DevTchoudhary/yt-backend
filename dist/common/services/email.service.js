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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: this.configService.get('SMTP_SECURE') === 'true',
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }
    async sendOtpEmail(email, otp, name) {
        try {
            const mailOptions = {
                from: this.configService.get('SMTP_FROM'),
                to: email,
                subject: 'Your OTP for Yukti Platform',
                html: this.getOtpEmailTemplate(otp, name),
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`OTP email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send OTP email to ${email}`, error);
            throw error;
        }
    }
    async sendWelcomeEmail(email, name, companyName) {
        try {
            const mailOptions = {
                from: this.configService.get('SMTP_FROM'),
                to: email,
                subject: 'Welcome to Yukti Platform',
                html: this.getWelcomeEmailTemplate(name, companyName),
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Welcome email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}`, error);
            throw error;
        }
    }
    async sendCompanyApprovalEmail(email, name, companyName, dashboardUrl) {
        try {
            const mailOptions = {
                from: this.configService.get('SMTP_FROM'),
                to: email,
                subject: 'Company Approved - Access Your Dashboard',
                html: this.getApprovalEmailTemplate(name, companyName, dashboardUrl),
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Approval email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send approval email to ${email}`, error);
            throw error;
        }
    }
    async sendInvitationEmail(email, name, inviterName, companyName, invitationToken, message) {
        try {
            const invitationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/accept-invitation?token=${invitationToken}`;
            const mailOptions = {
                from: this.configService.get('SMTP_FROM'),
                to: email,
                subject: `Invitation to join ${companyName} on Yukti Platform`,
                html: this.getInvitationEmailTemplate(name, inviterName, companyName, invitationUrl, message),
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Invitation email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send invitation email to ${email}`, error);
            throw error;
        }
    }
    async sendPasswordResetEmail(email, name, resetToken) {
        try {
            const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;
            const mailOptions = {
                from: this.configService.get('SMTP_FROM'),
                to: email,
                subject: 'Password Reset Request - Yukti Platform',
                html: this.getPasswordResetEmailTemplate(name, resetUrl),
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Password reset email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}`, error);
            throw error;
        }
    }
    async sendEmailChangeConfirmation(email, name, newEmail, otp) {
        try {
            const mailOptions = {
                from: this.configService.get('SMTP_FROM'),
                to: newEmail,
                subject: 'Confirm Email Change - Yukti Platform',
                html: this.getEmailChangeConfirmationTemplate(name, email, newEmail, otp),
            };
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email change confirmation sent to ${newEmail}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email change confirmation to ${newEmail}`, error);
            throw error;
        }
    }
    getOtpEmailTemplate(otp, name) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your OTP Code</h2>
        ${name ? `<p>Hello ${name},</p>` : '<p>Hello,</p>'}
        <p>Your OTP code for Yukti Platform is:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>Yukti Team</p>
      </div>
    `;
    }
    getWelcomeEmailTemplate(name, companyName) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Yukti Platform!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering ${companyName} with Yukti Platform.</p>
        <p>Your account is currently under review. You'll receive another email once your company is approved and you can access your dashboard.</p>
        <p>In the meantime, you can explore our platform with limited access.</p>
        <p>Best regards,<br>Yukti Team</p>
      </div>
    `;
    }
    getApprovalEmailTemplate(name, companyName, dashboardUrl) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Company Approved!</h2>
        <p>Hello ${name},</p>
        <p>Great news! ${companyName} has been approved on Yukti Platform.</p>
        <p>You can now access your dedicated dashboard at:</p>
        <div style="background-color: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <a href="${dashboardUrl}" style="color: #2e7d32; text-decoration: none; font-weight: bold;">${dashboardUrl}</a>
        </div>
        <p>Start managing your infrastructure and projects with our comprehensive SRE tools.</p>
        <p>Best regards,<br>Yukti Team</p>
      </div>
    `;
    }
    getInvitationEmailTemplate(name, inviterName, companyName, invitationUrl, message) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're Invited to Join ${companyName}!</h2>
        <p>Hello ${name},</p>
        <p>${inviterName} has invited you to join <strong>${companyName}</strong> on Yukti Platform.</p>
        ${message ? `<div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; font-style: italic;">"${message}"</div>` : ''}
        <p>Yukti Platform provides comprehensive SRE tools for infrastructure management, monitoring, and incident response.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" style="background-color: #2e7d32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
        </div>
        <p>This invitation will expire in 7 days. If you have any questions, please contact ${inviterName} or our support team.</p>
        <p>Best regards,<br>Yukti Team</p>
      </div>
    `;
    }
    getPasswordResetEmailTemplate(name, resetUrl) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password for your Yukti Platform account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
        <p>Best regards,<br>Yukti Team</p>
      </div>
    `;
    }
    getEmailChangeConfirmationTemplate(name, oldEmail, newEmail, otp) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Confirm Email Change</h2>
        <p>Hello ${name},</p>
        <p>You requested to change your email address from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
        <p>Please use the following OTP to confirm this change:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this email change, please contact our support team immediately.</p>
        <p>Best regards,<br>Yukti Team</p>
      </div>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map