export declare class ValidationService {
    private readonly tempEmailDomains;
    private readonly businessEmailDomains;
    isValidBusinessEmail(email: string): boolean;
    isValidCompanyAlias(alias: string): boolean;
    generateOtp(): string;
    isOtpExpired(expiresAt: Date): boolean;
    generateCompanyAlias(companyName: string): string;
    isValidPhoneNumber(phone: string): boolean;
    generateSecureToken(): string;
    generateApiKey(): string;
    validateStrongPassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    sanitizeInput(input: string): string;
    isValidUrl(url: string): boolean;
    maskEmail(email: string): string;
    maskPhoneNumber(phone: string): string;
}
