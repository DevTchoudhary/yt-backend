import { UserRole, UserStatus } from '../../common/interfaces/auth.interface';
export declare class UpdateUserDto {
    name?: string;
    role?: UserRole;
    permissions?: string[];
    status?: UserStatus;
}
export declare class UpdateUserStatusDto {
    status: UserStatus;
    reason?: string;
}
export declare class TransferOwnershipDto {
    newOwnerId: string;
    otp: string;
}
export declare class RemoveUserDto {
    userId: string;
    reason?: string;
    transferData?: boolean;
    transferToUserId?: string;
}
export declare class UpdateUserRoleDto {
    role: UserRole;
    permissions?: string[];
}
export declare class BulkUserActionDto {
    userIds: string[];
    action: 'activate' | 'deactivate' | 'suspend' | 'delete';
    reason?: string;
}
