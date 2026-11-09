import {
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthGuard, extractBearerToken } from './auth.guard';
import type { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

const contextFor = (headers: Record<string, string>) => {
  const request: { headers: Record<string, string>; user?: unknown } = { headers };
  const context = {
    getClass: () => class {},
    getHandler: () => () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
};

describe('extractBearerToken', () => {
  it('parses a bearer header', () => {
    expect(extractBearerToken('Bearer abc.def')).toBe('abc.def');
  });

  it.each([undefined, '', 'Bearer', 'Bearer   ', 'Basic abc'])(
    'rejects %p',
    (value) => {
      expect(extractBearerToken(value)).toBeNull();
    }
  );
});

describe('AuthGuard', () => {
  const user = { email: 'a@b.com', id: 'user-1' };
  const verify = jest.fn();
  const auth = { verifyAccessToken: verify } as unknown as AuthService;
  let reflector: Reflector;
  let guard: AuthGuard;

  beforeEach(() => {
    verify.mockReset();
    reflector = new Reflector();
    guard = new AuthGuard(reflector, auth);
  });

  it('attaches the verified user to the request', async () => {
    verify.mockResolvedValue(user);
    const { context, request } = contextFor({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verify).toHaveBeenCalledWith('good');
    expect(request.user).toEqual(user);
  });

  it('rejects a missing token without calling the verifier', async () => {
    const { context } = contextFor({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
    expect(verify).not.toHaveBeenCalled();
  });

  it('propagates verifier rejections', async () => {
    verify.mockRejectedValue(new UnauthorizedException());
    const { context } = contextFor({ authorization: 'Bearer bad' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it('skips public routes', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => key === IS_PUBLIC_KEY);
    const { context } = contextFor({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verify).not.toHaveBeenCalled();
  });
});
