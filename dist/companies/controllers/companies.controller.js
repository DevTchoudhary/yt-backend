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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const companies_service_1 = require("../services/companies.service");
const company_dto_1 = require("../dto/company.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const auth_decorator_1 = require("../../common/decorators/auth.decorator");
const auth_interface_1 = require("../../common/interfaces/auth.interface");
let CompaniesController = class CompaniesController {
    companiesService;
    constructor(companiesService) {
        this.companiesService = companiesService;
    }
    async findAll(query) {
        return this.companiesService.findAll(query);
    }
    async getStats() {
        return this.companiesService.getCompanyStats();
    }
    async checkAlias(alias) {
        const available = await this.companiesService.checkAliasAvailability(alias);
        return { alias, available };
    }
    async findOne(id) {
        return this.companiesService.findOne(id);
    }
    async findByAlias(alias) {
        return this.companiesService.findByAlias(alias);
    }
    async update(id, updateCompanyDto, user) {
        return this.companiesService.update(id, updateCompanyDto, user.role);
    }
    async approve(approveDto, user) {
        return this.companiesService.approve(approveDto.companyId, user.userId, approveDto.notes);
    }
    async reject(rejectDto, user) {
        return this.companiesService.reject(rejectDto.companyId, rejectDto.reason, user.userId);
    }
    async getDashboardUrl(id) {
        const url = await this.companiesService.getDashboardUrl(id);
        return { dashboardUrl: url };
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorator_1.Roles)(auth_interface_1.UserRole.ADMIN, auth_interface_1.UserRole.SRE),
    (0, auth_decorator_1.Permissions)(auth_interface_1.Permission.COMPANY_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get all companies' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Companies retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_dto_1.CompanyQueryDto]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, auth_decorator_1.Roles)(auth_interface_1.UserRole.ADMIN),
    (0, auth_decorator_1.Permissions)(auth_interface_1.Permission.ADMIN_COMPANIES),
    (0, swagger_1.ApiOperation)({ summary: 'Get company statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('check-alias/:alias'),
    (0, auth_decorator_1.Roles)(auth_interface_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Check if company alias is available' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Alias availability checked' }),
    __param(0, (0, common_1.Param)('alias')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "checkAlias", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, auth_decorator_1.Permissions)(auth_interface_1.Permission.COMPANY_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get company by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Company retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Company not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('alias/:alias'),
    (0, auth_decorator_1.Permissions)(auth_interface_1.Permission.COMPANY_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get company by alias' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Company retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Company not found' }),
    __param(0, (0, common_1.Param)('alias')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "findByAlias", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, auth_decorator_1.Permissions)(auth_interface_1.Permission.COMPANY_WRITE),
    (0, swagger_1.ApiOperation)({ summary: 'Update company' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Company updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Company not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, company_dto_1.UpdateCompanyDto, Object]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('approve'),
    (0, auth_decorator_1.Roles)(auth_interface_1.UserRole.ADMIN),
    (0, auth_decorator_1.Permissions)(auth_interface_1.Permission.COMPANY_APPROVE),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a company' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Company approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Company is not pending approval' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_dto_1.ApproveCompanyDto, Object]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('reject'),
    (0, auth_decorator_1.Roles)(auth_interface_1.UserRole.ADMIN),
    (0, auth_decorator_1.Permissions)(auth_interface_1.Permission.COMPANY_APPROVE),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a company' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Company rejected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Company is not pending approval' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_dto_1.RejectCompanyDto, Object]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)(':id/dashboard-url'),
    (0, auth_decorator_1.Permissions)(auth_interface_1.Permission.COMPANY_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Get company dashboard URL' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dashboard URL retrieved successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "getDashboardUrl", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, swagger_1.ApiTags)('Companies'),
    (0, common_1.Controller)('companies'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService])
], CompaniesController);
//# sourceMappingURL=companies.controller.js.map