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
var CompaniesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const company_entity_1 = require("../entities/company.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const email_service_1 = require("../../common/services/email.service");
const auth_interface_1 = require("../../common/interfaces/auth.interface");
let CompaniesService = CompaniesService_1 = class CompaniesService {
    companyModel;
    userModel;
    emailService;
    configService;
    logger = new common_1.Logger(CompaniesService_1.name);
    constructor(companyModel, userModel, emailService, configService) {
        this.companyModel = companyModel;
        this.userModel = userModel;
        this.emailService = emailService;
        this.configService = configService;
    }
    async findAll(query) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, search, } = query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { alias: { $regex: search, $options: 'i' } },
                { businessEmail: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const sortOptions = {
            [sortBy]: sortOrder === 'asc' ? 1 : -1,
        };
        const [companies, total] = await Promise.all([
            this.companyModel
                .find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.companyModel.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: companies,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async findOne(id) {
        const company = await this.companyModel.findById(id);
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        return company;
    }
    async findByAlias(alias) {
        const company = await this.companyModel.findOne({ alias });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        return company;
    }
    async update(id, updateCompanyDto, userRole) {
        const company = await this.companyModel.findById(id);
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        if (updateCompanyDto.status && userRole !== auth_interface_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can change company status');
        }
        Object.assign(company, updateCompanyDto);
        return company.save();
    }
    async approve(companyId, approvedBy) {
        const company = await this.companyModel.findById(companyId);
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        if (company.status !== auth_interface_1.CompanyStatus.PENDING) {
            throw new common_1.BadRequestException('Company is not pending approval');
        }
        company.status = auth_interface_1.CompanyStatus.APPROVED;
        company.approvedAt = new Date();
        company.approvedBy = approvedBy;
        await company.save();
        await this.userModel.updateMany({ companyId: company._id?.toString(), status: auth_interface_1.UserStatus.PENDING }, { status: auth_interface_1.UserStatus.ACTIVE });
        const companyAdmin = await this.userModel.findOne({
            companyId: company._id?.toString(),
            role: auth_interface_1.UserRole.CLIENT,
        });
        if (companyAdmin) {
            const dashboardUrl = `${this.configService.get('app.dashboardBaseUrl')}/${company.alias}`;
            try {
                await this.emailService.sendCompanyApprovalEmail(companyAdmin.email, companyAdmin.name, company.name, dashboardUrl);
            }
            catch (error) {
                this.logger.error('Failed to send approval email', error);
            }
        }
        this.logger.log(`Company approved: ${company.name} by ${approvedBy}`);
        return company;
    }
    async reject(companyId, reason, rejectedBy) {
        const company = await this.companyModel.findById(companyId);
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        if (company.status !== auth_interface_1.CompanyStatus.PENDING) {
            throw new common_1.BadRequestException('Company is not pending approval');
        }
        company.status = auth_interface_1.CompanyStatus.REJECTED;
        company.rejectionReason = reason;
        await company.save();
        await this.userModel.updateMany({ companyId: company._id?.toString() }, { status: auth_interface_1.UserStatus.INACTIVE });
        this.logger.log(`Company rejected: ${company.name} by ${rejectedBy}. Reason: ${reason}`);
        return company;
    }
    async getCompanyStats() {
        const stats = await this.companyModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
        const result = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            active: 0,
            inactive: 0,
        };
        for (const stat of stats) {
            if (stat &&
                typeof stat === 'object' &&
                '_id' in stat &&
                'count' in stat) {
                const id = String(stat._id);
                const count = Number(stat.count);
                result.total += count;
                result[id] = count;
            }
        }
        return result;
    }
    async getDashboardUrl(companyId) {
        const company = await this.findOne(companyId);
        return `${this.configService.get('app.dashboardBaseUrl')}/${company.alias}`;
    }
    async checkAliasAvailability(alias) {
        const company = await this.companyModel.findOne({ alias });
        return !company;
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = CompaniesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(company_entity_1.Company.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService,
        config_1.ConfigService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map