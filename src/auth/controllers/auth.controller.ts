import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import {
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  ChangeEmailDto,
  VerifySignupOtpDto,
  VerifyTokenDto,
} from '../dto/login.dto';
import {
  InviteUserDto,
  AcceptInvitationDto,
  ResendInvitationDto,
  BulkInviteDto,
} from '../dto/invitation.dto';
import {
  UpdateUserDto,
  UpdateUserStatusDto,
  RemoveUserDto,
  UpdateUserRoleDto,
  BulkUserActionDto,
} from '../dto/user-management.dto';
import {
  AuthResponseDto,
  LoginResponseDto,
  SignupResponseDto,
  UserResponseDto,
  TokenVerificationResponseDto,
} from '../dto/auth-response.dto';
import { Public, CurrentUser } from '../../common/decorators/auth.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestUser } from '../../common/interfaces/auth.interface';
import { UserStatus } from '../../common/interfaces/auth.interface';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user and company' })
  @ApiResponse({
    status: 201,
    description: 'User and company created successfully',
    type: SignupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User or company already exists' })
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponseDto> {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and send OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and get access tokens' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Omit<AuthResponseDto, 'accessToken' | 'refreshToken'>> {
    const result = await this.authService.verifyOtp(verifyOtpDto);

    // Set HttpOnly cookies
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return response without tokens
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken, refreshToken, ...responseWithoutTokens } = result;
    return responseWithoutTokens;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = (request.cookies as Record<string, unknown>)
      ?.refreshToken as string;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Set new HttpOnly cookies
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Tokens refreshed successfully' };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and clear tokens' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
  })
  logout(@Res({ passthrough: true }) response: Response) {
    // Clear HttpOnly cookies
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: RequestUser) {
    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      permissions: user.permissions,
    };
  }

  @Post('resend-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP to user email' })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.authService.resendOtp(resendOtpDto, ip);
  }

  @Post('resend-signup-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend signup verification OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async resendSignupOtp(
    @Body() resendOtpDto: ResendOtpDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.authService.resendSignupOtp(resendOtpDto, ip);
  }

  // User Invitation Endpoints
  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a user to the company' })
  @ApiResponse({ status: 201, description: 'User invited successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async inviteUser(
    @Body() inviteUserDto: InviteUserDto,
    @CurrentUser() user: RequestUser,
  ) {
    const currentUser = await this.authService.getUserById(user.userId);
    return this.authService.inviteUser(inviteUserDto, currentUser);
  }

  @Post('invite/bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite multiple users to the company' })
  @ApiResponse({ status: 201, description: 'Users invited successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async bulkInviteUsers(
    @Body() bulkInviteDto: BulkInviteDto,
    @CurrentUser() user: RequestUser,
  ) {
    const currentUser = await this.authService.getUserById(user.userId);
    const results: Array<{
      email: string;
      success: boolean;
      result?: any;
      error?: string;
    }> = [];

    for (const invitation of bulkInviteDto.invitations) {
      try {
        const result = await this.authService.inviteUser(
          invitation,
          currentUser,
        );
        results.push({ email: invitation.email, success: true, result });
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          email: invitation.email,
          success: false,
          error: errMsg,
        });
      }
    }

    return {
      message: 'Bulk invitation completed',
      results,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }

  @Post('invite/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend invitation to a user' })
  @ApiResponse({ status: 200, description: 'Invitation resent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resendInvitation(
    @Body() resendInvitationDto: ResendInvitationDto,
    @CurrentUser() user: RequestUser,
  ) {
    const currentUser = await this.authService.getUserById(user.userId);
    return this.authService.resendInvitation(resendInvitationDto, currentUser);
  }

  @Post('accept-invitation')
  @Public()
  @ApiOperation({ summary: 'Accept invitation and activate account' })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid invitation or OTP' })
  async acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Omit<AuthResponseDto, 'accessToken' | 'refreshToken'>> {
    const result = await this.authService.acceptInvitation(acceptInvitationDto);

    // Set HttpOnly cookies
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return response without tokens
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken, refreshToken, ...responseWithoutTokens } = result;
    return responseWithoutTokens;
  }

  @Public()
  @Post('verify-signup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify signup OTP and activate account' })
  @ApiResponse({
    status: 200,
    description: 'Account verified and activated successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifySignupOtp(
    @Body() verifySignupOtpDto: VerifySignupOtpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Omit<AuthResponseDto, 'accessToken' | 'refreshToken'>> {
    const result = await this.authService.verifySignupOtp(verifySignupOtpDto);

    // Set HttpOnly cookies
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return response without tokens
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken, refreshToken, ...responseWithoutTokens } = result;
    return responseWithoutTokens;
  }

  // User Management Endpoints
  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get company users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getCompanyUsers(
    @CurrentUser() user: RequestUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
  ) {
    return this.authService.getCompanyUsers(
      user.companyId,
      Number(page),
      Number(limit),
      status as UserStatus | undefined,
    );
  }

  @Patch('users/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: RequestUser,
  ) {
    const currentUser = await this.authService.getUserById(user.userId);
    const result = await this.authService.updateUser(
      userId,
      updateUserDto,
      currentUser,
    );
    return result;
  }

  @Patch('users/:userId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    const currentUser = await this.authService.getUserById(user.userId);
    return this.authService.updateUserStatus(
      userId,
      updateUserStatusDto,
      currentUser,
    );
  }

  @Patch('users/:userId/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user role and permissions' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @CurrentUser() user: RequestUser,
  ) {
    const currentUser = await this.authService.getUserById(user.userId);
    const result = await this.authService.updateUser(
      userId,
      updateUserRoleDto,
      currentUser,
    );
    return result;
  }

  @Delete('users/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove user from company' })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async removeUser(
    @Param('userId') userId: string,
    @Body() removeUserDto: RemoveUserDto,
    @CurrentUser() user: RequestUser,
  ) {
    const currentUser = await this.authService.getUserById(user.userId);
    return this.authService.removeUser(userId, removeUserDto, currentUser);
  }

  @Post('users/bulk-action')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform bulk action on users' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async bulkUserAction(
    @Body() bulkUserActionDto: BulkUserActionDto,
    @CurrentUser() user: RequestUser,
  ) {
    const currentUser = await this.authService.getUserById(user.userId);
    const { userIds, action, reason } = bulkUserActionDto;
    const results: Array<{
      userId: string;
      success: boolean;
      result?: any;
      error?: string;
    }> = [];

    for (const userId of userIds) {
      try {
        let result: unknown;
        switch (action) {
          case 'activate':
            result = await this.authService.updateUserStatus(
              userId,
              { status: UserStatus.ACTIVE },
              currentUser,
            );
            break;
          case 'deactivate':
            result = await this.authService.updateUserStatus(
              userId,
              { status: UserStatus.INACTIVE, reason },
              currentUser,
            );
            break;
          case 'suspend':
            result = await this.authService.updateUserStatus(
              userId,
              { status: UserStatus.SUSPENDED, reason },
              currentUser,
            );
            break;
          case 'delete':
            result = await this.authService.removeUser(
              userId,
              { userId, reason },
              currentUser,
            );
            break;
        }
        results.push({ userId, success: true, result: result ?? null });
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({ userId, success: false, error: errMsg });
      }
    }

    return {
      message: 'Bulk action completed',
      results,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  }

  @Post('change-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user email address' })
  @ApiResponse({ status: 200, description: 'Email changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or email' })
  async changeEmail(
    @Body() changeEmailDto: ChangeEmailDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.authService.changeEmail(
      user.userId,
      changeEmailDto,
    );
    return result;
  }

  @Public()
  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify JWT access token' })
  @ApiResponse({
    status: 200,
    description: 'Token verification result',
    type: TokenVerificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
    const result = await this.authService.verifyToken(verifyTokenDto.token);
    return result;
  }
}
