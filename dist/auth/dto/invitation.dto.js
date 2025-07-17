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
exports.BulkInviteDto = exports.ResendInvitationDto = exports.AcceptInvitationDto = exports.InviteUserDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const auth_interface_1 = require("../../common/interfaces/auth.interface");
class InviteUserDto {
    email;
    name;
    role;
    permissions;
    message;
}
exports.InviteUserDto = InviteUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@company.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], InviteUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], InviteUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: auth_interface_1.UserRole, example: auth_interface_1.UserRole.USER }),
    (0, class_validator_1.IsEnum)(auth_interface_1.UserRole),
    __metadata("design:type", String)
], InviteUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        example: ['read:projects', 'write:incidents']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], InviteUserDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Welcome to the team!' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InviteUserDto.prototype, "message", void 0);
class AcceptInvitationDto {
    token;
    otp;
}
exports.AcceptInvitationDto = AcceptInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'invitation-token-here' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AcceptInvitationDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AcceptInvitationDto.prototype, "otp", void 0);
class ResendInvitationDto {
    email;
}
exports.ResendInvitationDto = ResendInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@company.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], ResendInvitationDto.prototype, "email", void 0);
class BulkInviteDto {
    invitations;
}
exports.BulkInviteDto = BulkInviteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [InviteUserDto],
        example: [
            {
                email: 'user1@company.com',
                name: 'User One',
                role: 'user',
                permissions: ['read:projects']
            },
            {
                email: 'user2@company.com',
                name: 'User Two',
                role: 'user',
                permissions: ['read:projects', 'write:incidents']
            }
        ]
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkInviteDto.prototype, "invitations", void 0);
//# sourceMappingURL=invitation.dto.js.map