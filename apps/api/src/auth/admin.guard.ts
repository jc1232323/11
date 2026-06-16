import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

/**
 * Allows the request only when the authenticated user is an admin.
 * Must be used AFTER JwtAuthGuard so that request.user is populated.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    if (!user || !user.isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }
    return true;
  }
}
