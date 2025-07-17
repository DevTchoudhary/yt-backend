import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus, CompanyStatus } from '../../common/interfaces/auth.interface';

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

  @ApiProperty()
  phone: string;

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

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
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

  @ApiProperty()
  dashboardUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: CompanyResponseDto })
  company: CompanyResponseDto;
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
  requiresApproval: boolean;
}