import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@company.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'john@company.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ResendOtpDto {
  @ApiProperty({ example: 'john@company.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;
}

export class ChangeEmailDto {
  @ApiProperty({ example: 'newemail@company.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  newEmail: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}

export class VerifySignupOtpDto {
  @ApiProperty({ example: 'john@company.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}

export class VerifyTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
