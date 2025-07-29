import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../interfaces/auth.interface';
import { PERMISSIONS_KEY } from '../decorators/auth.decorator';
import { Request } from 'express';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { permissions?: string[] };
    if (user && Array.isArray(user.permissions)) {
      const hasPermission = requiredPermissions.every((permission) =>
        user.permissions!.includes(permission),
      );
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient permissions');
      }
      return true;
    }
    return false;
  }
}
