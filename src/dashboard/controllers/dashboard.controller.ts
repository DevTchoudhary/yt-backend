import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/auth.decorator';
import { RequestUser } from '../../common/interfaces/auth.interface';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard overview' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard(@CurrentUser() user: RequestUser) {
    return this.dashboardService.getDashboardData(user, user.companyId);
  }

  @Get('company/:alias')
  @ApiOperation({ summary: 'Get company dashboard by alias' })
  @ApiResponse({
    status: 200,
    description: 'Company dashboard retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCompanyDashboard(
    @Param('alias') alias: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.dashboardService.getCompanyDashboardByAlias(alias, user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@CurrentUser() user: RequestUser) {
    return this.dashboardService.getStats(user, user.companyId);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  getRecentActivity(@CurrentUser() user: RequestUser) {
    return this.dashboardService.getRecentActivity(user);
  }
}
