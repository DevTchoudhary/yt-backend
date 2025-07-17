import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from '../services/companies.service';
import { UpdateCompanyDto, CompanyQueryDto, ApproveCompanyDto, RejectCompanyDto } from '../dto/company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles, Permissions, CurrentUser } from '../../common/decorators/auth.decorator';
import { UserRole, Permission, RequestUser } from '../../common/interfaces/auth.interface';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SRE)
  @Permissions(Permission.COMPANY_READ)
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async findAll(@Query() query: CompanyQueryDto) {
    return this.companiesService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.ADMIN_COMPANIES)
  @ApiOperation({ summary: 'Get company statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return this.companiesService.getCompanyStats();
  }

  @Get('check-alias/:alias')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Check if company alias is available' })
  @ApiResponse({ status: 200, description: 'Alias availability checked' })
  async checkAlias(@Param('alias') alias: string) {
    const available = await this.companiesService.checkAliasAvailability(alias);
    return { alias, available };
  }

  @Get(':id')
  @Permissions(Permission.COMPANY_READ)
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Get('alias/:alias')
  @Permissions(Permission.COMPANY_READ)
  @ApiOperation({ summary: 'Get company by alias' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findByAlias(@Param('alias') alias: string) {
    return this.companiesService.findByAlias(alias);
  }

  @Patch(':id')
  @Permissions(Permission.COMPANY_WRITE)
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.companiesService.update(id, updateCompanyDto, user.role);
  }

  @Post('approve')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.COMPANY_APPROVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a company' })
  @ApiResponse({ status: 200, description: 'Company approved successfully' })
  @ApiResponse({ status: 400, description: 'Company is not pending approval' })
  async approve(@Body() approveDto: ApproveCompanyDto, @CurrentUser() user: RequestUser) {
    return this.companiesService.approve(approveDto.companyId, user.userId, approveDto.notes);
  }

  @Post('reject')
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.COMPANY_APPROVE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a company' })
  @ApiResponse({ status: 200, description: 'Company rejected successfully' })
  @ApiResponse({ status: 400, description: 'Company is not pending approval' })
  async reject(@Body() rejectDto: RejectCompanyDto, @CurrentUser() user: RequestUser) {
    return this.companiesService.reject(rejectDto.companyId, rejectDto.reason, user.userId);
  }

  @Get(':id/dashboard-url')
  @Permissions(Permission.COMPANY_READ)
  @ApiOperation({ summary: 'Get company dashboard URL' })
  @ApiResponse({ status: 200, description: 'Dashboard URL retrieved successfully' })
  async getDashboardUrl(@Param('id') id: string) {
    const url = await this.companiesService.getDashboardUrl(id);
    return { dashboardUrl: url };
  }
}