import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BusinessAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.trim())
  zipcode: string;
}

export class SignupDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;

  @ApiProperty({ example: 'john@company.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.trim())
  companyName: string;

  @ApiPropertyOptional({ example: 'acme-corp' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  companyAlias?: string;

  @ApiPropertyOptional({ example: 'contact@company.com' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  businessEmail?: string;

  @ApiPropertyOptional({ example: 'backup@company.com' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  backupEmail?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  phone?: string;

  @ApiPropertyOptional({ type: BusinessAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessAddressDto)
  businessAddress?: BusinessAddressDto;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
  })
  @IsOptional()
  @IsEnum(['startup', 'small', 'medium', 'large', 'enterprise'])
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

  @ApiPropertyOptional({ example: 'Technology' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ example: 'https://company.com' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiPropertyOptional({ example: 'Leading technology company' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
