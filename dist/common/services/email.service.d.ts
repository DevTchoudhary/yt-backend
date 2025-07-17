import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendOtpEmail(email: string, otp: string, name?: string): Promise<void>;
    sendWelcomeEmail(email: string, name: string, companyName: string): Promise<void>;
    sendCompanyApprovalEmail(email: string, name: string, companyName: string, dashboardUrl: string): Promise<void>;
    sendInvitationEmail(email: string, name: string, inviterName: string, companyName: string, invitationToken: string, message?: string): Promise<void>;
    sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void>;
    sendEmailChangeConfirmation(email: string, name: string, newEmail: string, otp: string): Promise<void>;
    private getOtpEmailTemplate;
    private getWelcomeEmailTemplate;
    private getApprovalEmailTemplate;
    private getInvitationEmailTemplate;
    private getPasswordResetEmailTemplate;
    private getEmailChangeConfirmationTemplate;
}
