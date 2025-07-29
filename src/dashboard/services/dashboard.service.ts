import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Company,
  CompanyDocument,
} from '../../companies/entities/company.entity';
import { User, UserDocument } from '../../users/entities/user.entity';
import {
  RequestUser,
  UserRole,
  CompanyStatus,
} from '../../common/interfaces/auth.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getDashboardData(user: RequestUser, companyId: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if user has access to this company
    if (user.companyId !== companyId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied to this company dashboard');
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

  async getCompanyDashboardByAlias(alias: string, user: RequestUser) {
    const company = await this.companyModel.findOne({ alias });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if user has access to this company
    if (
      user.companyId !== company._id?.toString() &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Access denied to this company dashboard');
    }

    return this.getDashboardData(user, company._id?.toString() || '');
  }

  async getStats(user: RequestUser, companyId: string) {
    const company = await this.companyModel.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
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
        total: 0, // Will be implemented when projects module is added
        active: 0,
        completed: 0,
      },
      incidents: {
        open: 0, // Will be implemented when incidents module is added
        resolved: 0,
        total: 0,
      },
    };

    return stats;
  }

  getRecentActivity(user: RequestUser) {
    // This is a placeholder for recent activity
    // In a real application, you would fetch from an activity log
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

  private getAvailableFeatures(role: UserRole, companyStatus: CompanyStatus) {
    const baseFeatures = ['dashboard', 'profile'];

    if (companyStatus === CompanyStatus.PENDING) {
      return [...baseFeatures, 'limited_view'];
    }

    if (
      companyStatus !== CompanyStatus.APPROVED &&
      companyStatus !== CompanyStatus.ACTIVE
    ) {
      return baseFeatures;
    }

    switch (role) {
      case UserRole.CLIENT:
        return [
          ...baseFeatures,
          'projects',
          'incidents',
          'reports',
          'settings',
        ];
      case UserRole.SRE:
        return [
          ...baseFeatures,
          'projects',
          'incidents',
          'monitoring',
          'deployments',
        ];
      case UserRole.ADMIN:
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

  private getQuickActions(role: UserRole, companyStatus: CompanyStatus) {
    if (companyStatus === CompanyStatus.PENDING) {
      return [
        {
          label: 'View Application Status',
          action: 'view_status',
          icon: 'clock',
        },
        { label: 'Contact Support', action: 'contact_support', icon: 'help' },
      ];
    }

    if (
      companyStatus !== CompanyStatus.APPROVED &&
      companyStatus !== CompanyStatus.ACTIVE
    ) {
      return [
        { label: 'Contact Support', action: 'contact_support', icon: 'help' },
      ];
    }

    const baseActions = [
      { label: 'View Profile', action: 'view_profile', icon: 'user' },
      { label: 'Settings', action: 'settings', icon: 'settings' },
    ];

    switch (role) {
      case UserRole.CLIENT:
        return [
          ...baseActions,
          {
            label: 'Create Incident',
            action: 'create_incident',
            icon: 'alert',
          },
          { label: 'View Reports', action: 'view_reports', icon: 'chart' },
        ];
      case UserRole.SRE:
        return [
          ...baseActions,
          {
            label: 'Monitor Systems',
            action: 'monitor_systems',
            icon: 'monitor',
          },
          { label: 'Deploy Application', action: 'deploy_app', icon: 'deploy' },
        ];
      case UserRole.ADMIN:
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

  private async getNotifications(
    user: RequestUser,
    companyId: string,
  ): Promise<
    Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      timestamp: Date;
      read: boolean;
    }>
  > {
    // This is a placeholder for notifications
    // In a real application, you would fetch from a notifications collection
    const notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      timestamp: Date;
      read: boolean;
    }> = [];

    const company = await this.companyModel.findById(companyId);

    if (company?.status === CompanyStatus.PENDING) {
      notifications.push({
        id: '1',
        type: 'info',
        title: 'Account Under Review',
        message:
          "Your company account is currently under review. You'll be notified once approved.",
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
}
