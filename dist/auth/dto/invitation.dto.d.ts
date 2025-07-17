import { UserRole } from '../../common/interfaces/auth.interface';
export declare class InviteUserDto {
    email: string;
    name: string;
    role: UserRole;
    permissions?: string[];
    message?: string;
}
export declare class AcceptInvitationDto {
    token: string;
    otp: string;
}
export declare class ResendInvitationDto {
    email: string;
}
export declare class BulkInviteDto {
    invitations: InviteUserDto[];
}
