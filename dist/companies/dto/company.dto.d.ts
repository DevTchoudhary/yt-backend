import { CompanyStatus } from '../../common/interfaces/auth.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class UpdateCompanyDto {
    name?: string;
    businessEmail?: string;
    backupEmail?: string;
    preferredTimezone?: string;
    status?: CompanyStatus;
    subscriptionPlan?: string;
    onboardingCompleted?: boolean;
}
export declare class CompanyQueryDto extends PaginationDto {
    status?: CompanyStatus;
    search?: string;
}
export declare class ApproveCompanyDto {
    companyId: string;
    notes?: string;
}
export declare class RejectCompanyDto {
    companyId: string;
    reason: string;
}
