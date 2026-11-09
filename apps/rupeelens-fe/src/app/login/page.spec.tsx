import { fireEvent, render, screen } from '@testing-library/react';

import LoginPage from './page';

const mockReplace = jest.fn();
const signInWithGoogle = jest.fn().mockResolvedValue(undefined);
let mockAuth: {
  loading: boolean;
  user: { id: string } | null;
  signInWithGoogle: jest.Mock;
};

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: mockReplace }) }));
jest.mock('@/lib/auth/AuthProvider', () => ({ useAuth: () => mockAuth }));
jest.mock('@/components/auth/AuthLayout', () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@/components/auth/AuthCard', () => ({
  AuthCard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const signInButton = () =>
  screen.getByRole('button', { name: /continue with google/i }) as HTMLButtonElement;

describe('LoginPage consent gating', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockReplace.mockReset();
    signInWithGoogle.mockClear();
    mockAuth = { loading: false, signInWithGoogle, user: null };
  });

  it('keeps sign-in disabled until the consent box is ticked', () => {
    render(<LoginPage />);
    expect(signInButton().disabled).toBe(true);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(signInButton().disabled).toBe(false);
  });

  it('persists consent when signing in', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(signInButton());
    expect(window.localStorage.getItem('rupeelens-consent')).toContain(
      'version'
    );
  });

  it('skips the checkbox for returning users with current consent', () => {
    window.localStorage.setItem(
      'rupeelens-consent',
      JSON.stringify({ acceptedAt: new Date().toISOString(), version: '2026-11-09' })
    );
    render(<LoginPage />);
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(signInButton().disabled).toBe(false);
  });

  it('redirects signed-in users home', () => {
    mockAuth = { loading: false, signInWithGoogle, user: { id: 'u1' } };
    render(<LoginPage />);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
