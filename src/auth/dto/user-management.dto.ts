import { IsEmail, IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../common/interfaces/auth.interface';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe Updated' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ 
    type: [String], 
    example: ['read:projects', 'write:incidents'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiPropertyOptional({ example: 'User violated company policy' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class TransferOwnershipDto {
  @ApiProperty({ example: 'user-id-to-transfer-to' })
  @IsString()
  @IsNotEmpty()
  newOwnerId: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class RemoveUserDto {
  @ApiProperty({ example: 'user-id-to-remove' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ example: 'User left the company' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  transferData?: boolean;

  @ApiPropertyOptional({ example: 'user-id-to-transfer-data-to' })
  @IsOptional()
  @IsString()
  transferToUserId?: string;
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ 
    type: [String], 
    example: ['read:projects', 'write:incidents'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class BulkUserActionDto {
  @ApiProperty({ type: [String], example: ['user1-id', 'user2-id'] })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ 
    enum: ['activate', 'deactivate', 'suspend', 'delete'],
    example: 'activate'
  })
  @IsEnum(['activate', 'deactivate', 'suspend', 'delete'])
  action: 'activate' | 'deactivate' | 'suspend' | 'delete';

  @ApiPropertyOptional({ example: 'Bulk action reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}