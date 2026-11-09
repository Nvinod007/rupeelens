import { render, screen } from '@testing-library/react';

import { AuthGate } from '../src/components/auth/AuthGate';

const mockReplace = jest.fn();
let mockPathname = '/';
let mockAuth: { loading: boolean; user: { id: string } | null } = {
  loading: false,
  user: null,
};

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('../src/lib/auth/AuthProvider', () => ({
  useAuth: () => mockAuth,
}));

describe('AuthGate', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockPathname = '/';
    mockAuth = { loading: false, user: null };
  });

  it('redirects signed-out users to /login and hides content', () => {
    render(
      <AuthGate>
        <p>secret</p>
      </AuthGate>
    );

    expect(mockReplace).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('secret')).toBeNull();
  });

  it('shows a loader (no redirect) while the session loads', () => {
    mockAuth = { loading: true, user: null };
    render(
      <AuthGate>
        <p>secret</p>
      </AuthGate>
    );

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText('Loading…')).toBeTruthy();
  });

  it('renders children for signed-in users', () => {
    mockAuth = { loading: false, user: { id: 'u1' } };
    render(
      <AuthGate>
        <p>secret</p>
      </AuthGate>
    );

    expect(screen.getByText('secret')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('keeps legal pages public', () => {
    mockPathname = '/privacy';
    render(
      <AuthGate>
        <p>policy</p>
      </AuthGate>
    );

    expect(screen.getByText('policy')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
