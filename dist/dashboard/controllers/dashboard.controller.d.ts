import { RequestUser } from '../../common/interfaces/auth.interface';
import { DashboardService } from '../services/dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(user: RequestUser): Promise<{
        company: {
            id: string | undefined;
            name: string;
            alias: string;
            status: import("../../common/interfaces/auth.interface").CompanyStatus;
            dashboardUrl: string;
            onboardingCompleted: boolean;
        };
        user: {
            id: string;
            email: string;
            role: import("../../common/interfaces/auth.interface").UserRole;
            permissions: string[];
        };
        features: string[];
        quickActions: {
            label: string;
            action: string;
            icon: string;
        }[];
        notifications: {
            id: string;
            type: string;
            title: string;
            message: string;
            timestamp: Date;
            read: boolean;
        }[];
    }>;
    getCompanyDashboard(alias: string, user: RequestUser): Promise<{
        company: {
            id: string | undefined;
            name: string;
            alias: string;
            status: import("../../common/interfaces/auth.interface").CompanyStatus;
            dashboardUrl: string;
            onboardingCompleted: boolean;
        };
        user: {
            id: string;
            email: string;
            role: import("../../common/interfaces/auth.interface").UserRole;
            permissions: string[];
        };
        features: string[];
        quickActions: {
            label: string;
            action: string;
            icon: string;
        }[];
        notifications: {
            id: string;
            type: string;
            title: string;
            message: string;
            timestamp: Date;
            read: boolean;
        }[];
    }>;
    getStats(user: RequestUser): Promise<{
        company: {
            status: import("../../common/interfaces/auth.interface").CompanyStatus;
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
    getRecentActivity(user: RequestUser): {
        id: string;
        type: string;
        description: string;
        timestamp: Date;
        user: string;
    }[];
}
