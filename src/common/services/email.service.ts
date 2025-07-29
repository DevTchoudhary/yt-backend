import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
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

  async sendOtpEmail(email: string, otp: string, name?: string): Promise<void> {
    // In development mode, just log the OTP instead of sending email
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(
        `🔐 OTP for ${email}: ${otp} (Development Mode - Not Sent via Email)`,
      );
      return;
    }

    try {
      const mailOptions = {
        from: String(this.configService.get('SMTP_FROM')),
        to: email,
        subject: 'Your OTP for Yukti Platform',
        html: this.getOtpEmailTemplate(otp, name),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send OTP email to ${email}`,
        error instanceof Error ? error.message : error,
      );
      throw new Error('Failed to send OTP email');
    }
  }

  async sendWelcomeEmail(
    email: string,
    name: string,
    companyName: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: String(this.configService.get('SMTP_FROM')),
        to: email,
        subject: 'Welcome to Yukti Platform',
        html: this.getWelcomeEmailTemplate(name, companyName),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send welcome email to ${email}`,
        error instanceof Error ? error.message : error,
      );
      throw new Error('Failed to send welcome email');
    }
  }

  async sendCompanyApprovalEmail(
    email: string,
    name: string,
    companyName: string,
    dashboardUrl: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: String(this.configService.get('SMTP_FROM')),
        to: email,
        subject: 'Company Approved - Access Your Dashboard',
        html: this.getApprovalEmailTemplate(name, companyName, dashboardUrl),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Approval email sent to ${email}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send approval email to ${email}`,
        error instanceof Error ? error.message : error,
      );
      throw new Error('Failed to send approval email');
    }
  }

  async sendInvitationEmail(
    email: string,
    name: string,
    inviterName: string,
    companyName: string,
    invitationToken: string,
    message?: string,
    otp?: string,
  ): Promise<void> {
    try {
      const invitationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/accept-invitation?token=${invitationToken}`;

      const mailOptions = {
        from: String(this.configService.get('SMTP_FROM')),
        to: email,
        subject: `Invitation to join ${companyName} on Yukti Platform`,
        html: this.getInvitationEmailTemplate(
          name,
          inviterName,
          companyName,
          invitationUrl,
          message,
          otp,
        ),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invitation email sent to ${email}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send invitation email to ${email}`,
        error instanceof Error ? error.message : error,
      );
      throw new Error('Failed to send invitation email');
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: String(this.configService.get('SMTP_FROM')),
        to: email,
        subject: 'Password Reset Request - Yukti Platform',
        html: this.getPasswordResetEmailTemplate(name, resetUrl),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error instanceof Error ? error.message : error,
      );
      throw new Error('Failed to send password reset email');
    }
  }

  async sendEmailChangeConfirmation(
    email: string,
    name: string,
    newEmail: string,
    otp: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: String(this.configService.get('SMTP_FROM')),
        to: newEmail,
        subject: 'Confirm Email Change - Yukti Platform',
        html: this.getEmailChangeConfirmationTemplate(
          name,
          email,
          newEmail,
          otp,
        ),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email change confirmation sent to ${newEmail}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send email change confirmation to ${newEmail}`,
        error instanceof Error ? error.message : error,
      );
      throw new Error('Failed to send email change confirmation');
    }
  }

  private getOtpEmailTemplate(otp: string, name?: string): string {
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

  private getWelcomeEmailTemplate(name: string, companyName: string): string {
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

  private getApprovalEmailTemplate(
    name: string,
    companyName: string,
    dashboardUrl: string,
  ): string {
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

  private getInvitationEmailTemplate(
    name: string,
    inviterName: string,
    companyName: string,
    invitationUrl: string,
    message?: string,
    otp?: string, // ✅ Add this line
  ): string {
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
      ${otp ? `<p><strong>Your OTP is: ${otp}</strong></p>` : ''}
    </div>
  `;
  }

  private getPasswordResetEmailTemplate(
    name: string,
    resetUrl: string,
  ): string {
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

  private getEmailChangeConfirmationTemplate(
    name: string,
    oldEmail: string,
    newEmail: string,
    otp: string,
  ): string {
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
}
