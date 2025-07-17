import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Company, CompanyDocument } from '../entities/company.entity';
import { User, UserDocument } from '../../users/entities/user.entity';
import { EmailService } from '../../common/services/email.service';
import { UpdateCompanyDto, CompanyQueryDto } from '../dto/company.dto';
import {
  CompanyStatus,
  UserRole,
  UserStatus,
} from '../../common/interfaces/auth.interface';
import { PaginatedResponse } from '../../common/interfaces/base.interface';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async findAll(query: CompanyQueryDto): Promise<PaginatedResponse<Company>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, search } = query;
    
    const filter: any = {};
    
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
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

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

  async findOne(id: string): Promise<Company> {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async findByAlias(alias: string): Promise<Company> {
    const company = await this.companyModel.findOne({ alias });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userRole: UserRole): Promise<Company> {
    const company = await this.companyModel.findById(id);
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Only admins can change status
    if (updateCompanyDto.status && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change company status');
    }

    Object.assign(company, updateCompanyDto);
    return company.save();
  }

  async approve(companyId: string, approvedBy: string, notes?: string): Promise<Company> {
    const company = await this.companyModel.findById(companyId);
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    
    if (company.status !== CompanyStatus.PENDING) {
      throw new BadRequestException('Company is not pending approval');
    }

    company.status = CompanyStatus.APPROVED;
    company.approvedAt = new Date();
    company.approvedBy = approvedBy;
    
    await company.save();

    // Update all users in this company to active status
    await this.userModel.updateMany(
      { companyId: company._id?.toString(), status: UserStatus.PENDING },
      { status: UserStatus.ACTIVE }
    );

    // Send approval email to company admin
    const companyAdmin = await this.userModel.findOne({
      companyId: company._id?.toString(),
      role: UserRole.CLIENT,
    });

    if (companyAdmin) {
      const dashboardUrl = `${this.configService.get('app.dashboardBaseUrl')}/${company.alias}`;
      try {
        await this.emailService.sendCompanyApprovalEmail(
          companyAdmin.email,
          companyAdmin.name,
          company.name,
          dashboardUrl,
        );
      } catch (error) {
        this.logger.error('Failed to send approval email', error);
      }
    }

    this.logger.log(`Company approved: ${company.name} by ${approvedBy}`);
    return company;
  }

  async reject(companyId: string, reason: string, rejectedBy: string): Promise<Company> {
    const company = await this.companyModel.findById(companyId);
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    
    if (company.status !== CompanyStatus.PENDING) {
      throw new BadRequestException('Company is not pending approval');
    }

    company.status = CompanyStatus.REJECTED;
    company.rejectionReason = reason;
    
    await company.save();

    // Update all users in this company to inactive status
    await this.userModel.updateMany(
      { companyId: company._id?.toString() },
      { status: UserStatus.INACTIVE }
    );

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

    stats.forEach((stat) => {
      result.total += stat.count;
      result[stat._id] = stat.count;
    });

    return result;
  }

  async getDashboardUrl(companyId: string): Promise<string> {
    const company = await this.findOne(companyId);
    return `${this.configService.get('app.dashboardBaseUrl')}/${company.alias}`;
  }

  async checkAliasAvailability(alias: string): Promise<boolean> {
    const company = await this.companyModel.findOne({ alias });
    return !company;
  }
}