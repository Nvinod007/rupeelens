import type { AuthUser } from '@shared-types';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & { user?: AuthUser };
