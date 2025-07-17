import { CompaniesService } from '../services/companies.service';
import { UpdateCompanyDto, CompanyQueryDto, ApproveCompanyDto, RejectCompanyDto } from '../dto/company.dto';
import { RequestUser } from '../../common/interfaces/auth.interface';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    findAll(query: CompanyQueryDto): Promise<import("../../common/interfaces/base.interface").PaginatedResponse<import("../entities/company.entity").Company>>;
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        active: number;
        inactive: number;
    }>;
    checkAlias(alias: string): Promise<{
        alias: string;
        available: boolean;
    }>;
    findOne(id: string): Promise<import("../entities/company.entity").Company>;
    findByAlias(alias: string): Promise<import("../entities/company.entity").Company>;
    update(id: string, updateCompanyDto: UpdateCompanyDto, user: RequestUser): Promise<import("../entities/company.entity").Company>;
    approve(approveDto: ApproveCompanyDto, user: RequestUser): Promise<import("../entities/company.entity").Company>;
    reject(rejectDto: RejectCompanyDto, user: RequestUser): Promise<import("../entities/company.entity").Company>;
    getDashboardUrl(id: string): Promise<{
        dashboardUrl: string;
    }>;
}
