import { ApiProperty } from '@nestjs/swagger';
import {
  UserRole,
  UserStatus,
  CompanyStatus,
} from '../../common/interfaces/auth.interface';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  companyId: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  twoFactorEnabled: boolean;

  @ApiProperty()
  lastLogin?: Date;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}

export class CompanyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  alias: string;

  @ApiProperty()
  businessEmail: string;

  @ApiProperty({ enum: CompanyStatus })
  status: CompanyStatus;

  @ApiProperty()
  subscriptionPlan: string;

  @ApiProperty()
  onboardingCompleted: boolean;

  @ApiProperty({ required: false })
  dashboardUrl?: string;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: CompanyResponseDto, required: false })
  company?: CompanyResponseDto | null;
}

export class LoginResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  otpSent: boolean;
}

export class SignupResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  otpSent: boolean;

  @ApiProperty()
  requiresVerification: boolean;
}

export class TokenVerificationResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty({ type: UserResponseDto, required: false })
  user?: UserResponseDto;

  @ApiProperty({ type: CompanyResponseDto, required: false })
  company?: CompanyResponseDto;

  @ApiProperty({ required: false })
  expiresAt?: Date;

  @ApiProperty({ required: false })
  error?: string;
}
