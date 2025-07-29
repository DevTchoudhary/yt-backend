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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenVerificationResponseDto = exports.SignupResponseDto = exports.LoginResponseDto = exports.AuthResponseDto = exports.CompanyResponseDto = exports.UserResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const auth_interface_1 = require("../../common/interfaces/auth.interface");
class UserResponseDto {
    id;
    email;
    name;
    role;
    companyId;
    phone;
    timezone;
    status;
    emailVerified;
    twoFactorEnabled;
    lastLogin;
    createdAt;
    updatedAt;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: auth_interface_1.UserRole }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: auth_interface_1.UserStatus }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "emailVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "twoFactorEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "lastLogin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
class CompanyResponseDto {
    id;
    name;
    alias;
    businessEmail;
    status;
    subscriptionPlan;
    onboardingCompleted;
    dashboardUrl;
    createdAt;
    updatedAt;
}
exports.CompanyResponseDto = CompanyResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "alias", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "businessEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: auth_interface_1.CompanyStatus }),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], CompanyResponseDto.prototype, "onboardingCompleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "dashboardUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], CompanyResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], CompanyResponseDto.prototype, "updatedAt", void 0);
class AuthResponseDto {
    accessToken;
    refreshToken;
    user;
    company;
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserResponseDto }),
    __metadata("design:type", UserResponseDto)
], AuthResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CompanyResponseDto, required: false }),
    __metadata("design:type", Object)
], AuthResponseDto.prototype, "company", void 0);
class LoginResponseDto {
    message;
    otpSent;
}
exports.LoginResponseDto = LoginResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], LoginResponseDto.prototype, "otpSent", void 0);
class SignupResponseDto {
    message;
    userId;
    companyId;
    otpSent;
    requiresVerification;
}
exports.SignupResponseDto = SignupResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SignupResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SignupResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SignupResponseDto.prototype, "companyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SignupResponseDto.prototype, "otpSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SignupResponseDto.prototype, "requiresVerification", void 0);
class TokenVerificationResponseDto {
    valid;
    user;
    company;
    expiresAt;
    error;
}
exports.TokenVerificationResponseDto = TokenVerificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], TokenVerificationResponseDto.prototype, "valid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: UserResponseDto, required: false }),
    __metadata("design:type", UserResponseDto)
], TokenVerificationResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CompanyResponseDto, required: false }),
    __metadata("design:type", CompanyResponseDto)
], TokenVerificationResponseDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Date)
], TokenVerificationResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], TokenVerificationResponseDto.prototype, "error", void 0);
//# sourceMappingURL=auth-response.dto.js.map