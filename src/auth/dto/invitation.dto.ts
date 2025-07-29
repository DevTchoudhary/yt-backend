import { IsEmail, IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/interfaces/auth.interface';

export class InviteUserDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ 
    type: [String], 
    example: ['read:projects', 'write:incident'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ example: 'Welcome to the team!' })
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phone?: string;
}

export class AcceptInvitationDto {
  @ApiProperty({ example: 'invitation-token-here' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ResendInvitationDto {
  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}

export class BulkInviteDto {
  @ApiProperty({ 
    type: [InviteUserDto],
    example: [
      {
        email: 'user1@company.com',
        name: 'User One',
        role: 'user',
        permissions: ['read:projects']
      },
      {
        email: 'user2@company.com', 
        name: 'User Two',
        role: 'user',
        permissions: ['read:projects', 'write:incidents']
      }
    ]
  })
  @IsArray()
  invitations: InviteUserDto[];
}