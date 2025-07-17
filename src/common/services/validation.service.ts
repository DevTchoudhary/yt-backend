import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationService {
  private readonly tempEmailDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'temp-mail.org',
    'throwaway.email',
    'yopmail.com',
    'maildrop.cc',
    'sharklasers.com',
    'guerrillamailblock.com',
    'pokemail.net',
    'spam4.me',
    'bccto.me',
    'chacuo.net',
    'dispostable.com',
    'emailondeck.com',
    'fakeinbox.com',
    'hide.biz.st',
    'mytrashmail.com',
    'nobulk.com',
    'sogetthis.com',
    'spamherelots.com',
    'superrito.com',
    'zoemail.org',
  ];

  private readonly businessEmailDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'zoho.com',
  ];

  isValidBusinessEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      return false;
    }

    // Check if it's a temporary email domain
    if (this.tempEmailDomains.includes(domain)) {
      return false;
    }

    // For business validation, we can be more lenient
    // Allow common business domains and any domain that's not in temp list
    return true;
  }

  isValidCompanyAlias(alias: string): boolean {
    // Company alias should be URL-safe and professional
    const aliasRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    
    if (alias.length < 3 || alias.length > 50) {
      return false;
    }

    if (!aliasRegex.test(alias)) {
      return false;
    }

    // Check for reserved words
    const reservedWords = [
      'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'test',
      'staging', 'dev', 'development', 'prod', 'production',
      'app', 'application', 'service', 'server', 'database',
      'yukti', 'support', 'help', 'docs', 'documentation',
    ];

    if (reservedWords.includes(alias.toLowerCase())) {
      return false;
    }

    return true;
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  isOtpExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  generateCompanyAlias(companyName: string): string {
    // Generate a URL-safe alias from company name
    let alias = companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // Ensure minimum length
    if (alias.length < 3) {
      alias = alias + '-' + Math.floor(Math.random() * 1000);
    }

    // Ensure maximum length
    if (alias.length > 50) {
      alias = alias.substring(0, 47) + Math.floor(Math.random() * 100);
    }

    return alias;
  }

  isValidPhoneNumber(phone: string): boolean {
    // Basic international phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
  }

  generateSecureToken(): string {
    // Generate a secure random token for invitations, password resets, etc.
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  generateApiKey(): string {
    // Generate API key with prefix
    const crypto = require('crypto');
    const prefix = 'yk_';
    const randomPart = crypto.randomBytes(24).toString('hex');
    return prefix + randomPart;
  }

  validateStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  sanitizeInput(input: string): string {
    // Basic input sanitization
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.substring(0, 2)}***@${domain}`;
  }

  maskPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      return '***' + cleaned.slice(-2);
    }
    return '***' + cleaned.slice(-4);
  }
}