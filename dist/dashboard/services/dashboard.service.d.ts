import { Model } from 'mongoose';
import { CompanyDocument } from '../../companies/entities/company.entity';
import { UserDocument } from '../../users/entities/user.entity';
import { RequestUser, UserRole, CompanyStatus } from '../../common/interfaces/auth.interface';
export declare class DashboardService {
    private companyModel;
    private userModel;
    constructor(companyModel: Model<CompanyDocument>, userModel: Model<UserDocument>);
    getDashboardData(user: RequestUser, companyId: string): Promise<{
        company: {
            id: string | undefined;
            name: string;
            alias: string;
            status: CompanyStatus;
            dashboardUrl: string;
            onboardingCompleted: boolean;
        };
        user: {
            id: string;
            email: string;
            role: UserRole;
            permissions: string[];
        };
        features: string[];
        quickActions: {
            label: string;
            action: string;
            icon: string;
        }[];
        notifications: any[];
    }>;
    getCompanyDashboardByAlias(alias: string, user: RequestUser): Promise<{
        company: {
            id: string | undefined;
            name: string;
            alias: string;
            status: CompanyStatus;
            dashboardUrl: string;
            onboardingCompleted: boolean;
        };
        user: {
            id: string;
            email: string;
            role: UserRole;
            permissions: string[];
        };
        features: string[];
        quickActions: {
            label: string;
            action: string;
            icon: string;
        }[];
        notifications: any[];
    }>;
    getStats(user: RequestUser, companyId: string): Promise<{
        company: {
            status: CompanyStatus;
            createdAt: Date | undefined;
            lastActivityAt: Date | undefined;
            subscriptionPlan: string;
        };
        users: {
            total: number;
            active: number;
            pending: number;
        };
        projects: {
            total: number;
            active: number;
            completed: number;
        };
        incidents: {
            open: number;
            resolved: number;
            total: number;
        };
    }>;
    getRecentActivity(user: RequestUser, companyId: string): Promise<{
        id: string;
        type: string;
        description: string;
        timestamp: Date;
        user: string;
    }[]>;
    private getAvailableFeatures;
    private getQuickActions;
    private getNotifications;
}
