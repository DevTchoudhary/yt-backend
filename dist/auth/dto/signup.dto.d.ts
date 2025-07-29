export declare class BusinessAddressDto {
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
}
export declare class SignupDto {
    name: string;
    email: string;
    companyName: string;
    companyAlias?: string;
    businessEmail?: string;
    backupEmail?: string;
    phone?: string;
    businessAddress?: BusinessAddressDto;
    timezone?: string;
    companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    industry?: string;
    website?: string;
    description?: string;
}
