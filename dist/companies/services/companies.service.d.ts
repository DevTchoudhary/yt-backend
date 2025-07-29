import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Company, CompanyDocument } from '../entities/company.entity';
import { UserDocument } from '../../users/entities/user.entity';
import { EmailService } from '../../common/services/email.service';
import { UpdateCompanyDto, CompanyQueryDto } from '../dto/company.dto';
import { UserRole } from '../../common/interfaces/auth.interface';
import { PaginatedResponse } from '../../common/interfaces/base.interface';
export declare class CompaniesService {
    private companyModel;
    private userModel;
    private emailService;
    private configService;
    private readonly logger;
    constructor(companyModel: Model<CompanyDocument>, userModel: Model<UserDocument>, emailService: EmailService, configService: ConfigService);
    findAll(query: CompanyQueryDto): Promise<PaginatedResponse<Company>>;
    findOne(id: string): Promise<Company>;
    findByAlias(alias: string): Promise<Company>;
    update(id: string, updateCompanyDto: UpdateCompanyDto, userRole: UserRole): Promise<Company>;
    approve(companyId: string, approvedBy: string): Promise<Company>;
    reject(companyId: string, reason: string, rejectedBy: string): Promise<Company>;
    getCompanyStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        active: number;
        inactive: number;
    }>;
    getDashboardUrl(companyId: string): Promise<string>;
    checkAliasAvailability(alias: string): Promise<boolean>;
}
