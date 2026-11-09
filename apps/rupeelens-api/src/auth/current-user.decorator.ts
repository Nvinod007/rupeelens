import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthUser } from '@shared-types';

import type { AuthenticatedRequest } from './auth.types';

/** Injects the full authenticated user. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
);

/** Injects only the authenticated user's id (the data-ownership key). */
export const UserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) {
      throw new UnauthorizedException();
    }
    return user.id;
  }
);
