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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const company_entity_1 = require("../../companies/entities/company.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const auth_interface_1 = require("../../common/interfaces/auth.interface");
let DashboardService = class DashboardService {
    companyModel;
    userModel;
    constructor(companyModel, userModel) {
        this.companyModel = companyModel;
        this.userModel = userModel;
    }
    async getDashboardData(user, companyId) {
        const company = await this.companyModel.findById(companyId);
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        if (user.companyId !== companyId && user.role !== auth_interface_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Access denied to this company dashboard');
        }
        const dashboardData = {
            company: {
                id: company._id?.toString(),
                name: company.name,
                alias: company.alias,
                status: company.status,
                dashboardUrl: `${process.env.DASHBOARD_BASE_URL}/${company.alias}`,
                onboardingCompleted: company.onboardingCompleted,
            },
            user: {
                id: user.userId,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
            },
            features: this.getAvailableFeatures(user.role, company.status),
            quickActions: this.getQuickActions(user.role, company.status),
            notifications: await this.getNotifications(user, companyId),
        };
        return dashboardData;
    }
    async getCompanyDashboardByAlias(alias, user) {
        const company = await this.companyModel.findOne({ alias });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        if (user.companyId !== company._id?.toString() &&
            user.role !== auth_interface_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Access denied to this company dashboard');
        }
        return this.getDashboardData(user, company._id?.toString() || '');
    }
    async getStats(user, companyId) {
        const company = await this.companyModel.findById(companyId);
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        const stats = {
            company: {
                status: company.status,
                createdAt: company.createdAt,
                lastActivityAt: company.lastActivityAt,
                subscriptionPlan: company.subscriptionPlan,
            },
            users: {
                total: await this.userModel.countDocuments({ companyId }),
                active: await this.userModel.countDocuments({
                    companyId,
                    status: 'active',
                }),
                pending: await this.userModel.countDocuments({
                    companyId,
                    status: 'pending',
                }),
            },
            projects: {
                total: 0,
                active: 0,
                completed: 0,
            },
            incidents: {
                open: 0,
                resolved: 0,
                total: 0,
            },
        };
        return stats;
    }
    getRecentActivity(user) {
        const activities = [
            {
                id: '1',
                type: 'user_login',
                description: `${user.email} logged in`,
                timestamp: new Date(),
                user: user.email,
            },
            {
                id: '2',
                type: 'dashboard_access',
                description: 'Dashboard accessed',
                timestamp: new Date(),
                user: user.email,
            },
        ];
        return activities;
    }
    getAvailableFeatures(role, companyStatus) {
        const baseFeatures = ['dashboard', 'profile'];
        if (companyStatus === auth_interface_1.CompanyStatus.PENDING) {
            return [...baseFeatures, 'limited_view'];
        }
        if (companyStatus !== auth_interface_1.CompanyStatus.APPROVED &&
            companyStatus !== auth_interface_1.CompanyStatus.ACTIVE) {
            return baseFeatures;
        }
        switch (role) {
            case auth_interface_1.UserRole.CLIENT:
                return [
                    ...baseFeatures,
                    'projects',
                    'incidents',
                    'reports',
                    'settings',
                ];
            case auth_interface_1.UserRole.SRE:
                return [
                    ...baseFeatures,
                    'projects',
                    'incidents',
                    'monitoring',
                    'deployments',
                ];
            case auth_interface_1.UserRole.ADMIN:
                return [
                    ...baseFeatures,
                    'user_management',
                    'company_management',
                    'system_settings',
                ];
            default:
                return baseFeatures;
        }
    }
    getQuickActions(role, companyStatus) {
        if (companyStatus === auth_interface_1.CompanyStatus.PENDING) {
            return [
                {
                    label: 'View Application Status',
                    action: 'view_status',
                    icon: 'clock',
                },
                { label: 'Contact Support', action: 'contact_support', icon: 'help' },
            ];
        }
        if (companyStatus !== auth_interface_1.CompanyStatus.APPROVED &&
            companyStatus !== auth_interface_1.CompanyStatus.ACTIVE) {
            return [
                { label: 'Contact Support', action: 'contact_support', icon: 'help' },
            ];
        }
        const baseActions = [
            { label: 'View Profile', action: 'view_profile', icon: 'user' },
            { label: 'Settings', action: 'settings', icon: 'settings' },
        ];
        switch (role) {
            case auth_interface_1.UserRole.CLIENT:
                return [
                    ...baseActions,
                    {
                        label: 'Create Incident',
                        action: 'create_incident',
                        icon: 'alert',
                    },
                    { label: 'View Reports', action: 'view_reports', icon: 'chart' },
                ];
            case auth_interface_1.UserRole.SRE:
                return [
                    ...baseActions,
                    {
                        label: 'Monitor Systems',
                        action: 'monitor_systems',
                        icon: 'monitor',
                    },
                    { label: 'Deploy Application', action: 'deploy_app', icon: 'deploy' },
                ];
            case auth_interface_1.UserRole.ADMIN:
                return [
                    ...baseActions,
                    { label: 'Manage Users', action: 'manage_users', icon: 'users' },
                    {
                        label: 'Approve Companies',
                        action: 'approve_companies',
                        icon: 'check',
                    },
                ];
            default:
                return baseActions;
        }
    }
    async getNotifications(user, companyId) {
        const notifications = [];
        const company = await this.companyModel.findById(companyId);
        if (company?.status === auth_interface_1.CompanyStatus.PENDING) {
            notifications.push({
                id: '1',
                type: 'info',
                title: 'Account Under Review',
                message: "Your company account is currently under review. You'll be notified once approved.",
                timestamp: new Date(),
                read: false,
            });
        }
        if (!company?.onboardingCompleted) {
            notifications.push({
                id: '2',
                type: 'warning',
                title: 'Complete Onboarding',
                message: 'Complete your company onboarding to access all features.',
                timestamp: new Date(),
                read: false,
            });
        }
        return notifications;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(company_entity_1.Company.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map