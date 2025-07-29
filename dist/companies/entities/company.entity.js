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
exports.CompanySchema = exports.Company = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const auth_interface_1 = require("../../common/interfaces/auth.interface");
let Company = class Company {
    name;
    alias;
    businessEmail;
    backupEmail;
    businessAddress;
    preferredTimezone;
    status;
    subscriptionPlan;
    onboardingCompleted;
    settings;
    metadata;
    approvedAt;
    approvedBy;
    rejectionReason;
    lastActivityAt;
    createdAt;
    updatedAt;
};
exports.Company = Company;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true }),
    __metadata("design:type", String)
], Company.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Company.prototype, "alias", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Company.prototype, "businessEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ lowercase: true, trim: true }),
    __metadata("design:type", String)
], Company.prototype, "backupEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, required: true },
            zipcode: { type: String, required: true },
        },
        required: false,
    }),
    __metadata("design:type", Object)
], Company.prototype, "businessAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'UTC' }),
    __metadata("design:type", String)
], Company.prototype, "preferredTimezone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: auth_interface_1.CompanyStatus, default: auth_interface_1.CompanyStatus.PENDING }),
    __metadata("design:type", String)
], Company.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'basic' }),
    __metadata("design:type", String)
], Company.prototype, "subscriptionPlan", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Company.prototype, "onboardingCompleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            alertChannels: {
                type: [
                    {
                        type: {
                            type: String,
                            enum: ['email', 'slack', 'teams', 'webhook', 'sms'],
                        },
                        config: { type: Object },
                        enabled: { type: Boolean, default: true },
                    },
                ],
                default: [],
            },
            notificationPreferences: {
                type: {
                    incidents: { type: Boolean, default: true },
                    maintenance: { type: Boolean, default: true },
                    reports: { type: Boolean, default: true },
                    security: { type: Boolean, default: true },
                },
                default: {},
            },
            dashboardSettings: {
                type: {
                    theme: { type: String, default: 'light' },
                    defaultView: { type: String, default: 'overview' },
                    autoRefresh: { type: Boolean, default: true },
                    refreshInterval: { type: Number, default: 30 },
                },
                default: {},
            },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Company.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            industry: { type: String },
            size: {
                type: String,
                enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
            },
            website: { type: String },
            description: { type: String },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Company.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Company.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Company.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Company.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Company.prototype, "lastActivityAt", void 0);
exports.Company = Company = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'companies',
    })
], Company);
exports.CompanySchema = mongoose_1.SchemaFactory.createForClass(Company);
exports.CompanySchema.index({ name: 1 }, { unique: true });
exports.CompanySchema.index({ alias: 1 }, { unique: true });
exports.CompanySchema.index({ status: 1 });
exports.CompanySchema.index({ createdAt: -1 });
exports.CompanySchema.index({ businessEmail: 1 });
exports.CompanySchema.virtual('dashboardUrl').get(function () {
    return `${process.env.DASHBOARD_BASE_URL}/${this.alias}`;
});
exports.CompanySchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'companyId',
});
exports.CompanySchema.virtual('projects', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'companyId',
});
exports.CompanySchema.set('toJSON', { virtuals: true });
exports.CompanySchema.set('toObject', { virtuals: true });
//# sourceMappingURL=company.entity.js.map