"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let ValidationService = class ValidationService {
    tempEmailDomains = [
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
    businessEmailDomains = [
        'gmail.com',
        'yahoo.com',
        'hotmail.com',
        'outlook.com',
        'aol.com',
        'icloud.com',
        'protonmail.com',
        'zoho.com',
    ];
    isValidBusinessEmail(email) {
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain) {
            return false;
        }
        if (this.tempEmailDomains.includes(domain)) {
            return false;
        }
        return true;
    }
    isValidCompanyAlias(alias) {
        const aliasRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
        if (alias.length < 3 || alias.length > 50) {
            return false;
        }
        if (!aliasRegex.test(alias)) {
            return false;
        }
        const reservedWords = [
            'admin',
            'api',
            'www',
            'mail',
            'ftp',
            'localhost',
            'test',
            'staging',
            'dev',
            'development',
            'prod',
            'production',
            'app',
            'application',
            'service',
            'server',
            'database',
            'yukti',
            'support',
            'help',
            'docs',
            'documentation',
        ];
        if (reservedWords.includes(alias.toLowerCase())) {
            return false;
        }
        return true;
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    isOtpExpired(expiresAt) {
        return new Date() > expiresAt;
    }
    generateCompanyAlias(companyName) {
        let alias = companyName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        if (alias.length < 3) {
            alias = alias + '-' + Math.floor(Math.random() * 1000);
        }
        if (alias.length > 50) {
            alias = alias.substring(0, 47) + Math.floor(Math.random() * 100);
        }
        return alias;
    }
    isValidPhoneNumber(phone) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
    }
    generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    generateApiKey() {
        const prefix = 'yk_';
        const randomPart = crypto.randomBytes(24).toString('hex');
        return prefix + randomPart;
    }
    validateStrongPassword(password) {
        const errors = [];
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
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    sanitizeInput(input) {
        return input
            .trim()
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '');
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    maskEmail(email) {
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) {
            return `${localPart[0]}***@${domain}`;
        }
        return `${localPart.substring(0, 2)}***@${domain}`;
    }
    maskPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length <= 4) {
            return '***' + cleaned.slice(-2);
        }
        return '***' + cleaned.slice(-4);
    }
};
exports.ValidationService = ValidationService;
exports.ValidationService = ValidationService = __decorate([
    (0, common_1.Injectable)()
], ValidationService);
//# sourceMappingURL=validation.service.js.map