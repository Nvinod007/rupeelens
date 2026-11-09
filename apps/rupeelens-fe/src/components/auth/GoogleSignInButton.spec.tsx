import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GoogleSignInButton } from './GoogleSignInButton';

const signInWithGoogle = jest.fn();
let mockAuth = { loading: false, signInWithGoogle };

jest.mock('@/lib/auth/AuthProvider', () => ({ useAuth: () => mockAuth }));

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    signInWithGoogle.mockReset();
    mockAuth = { loading: false, signInWithGoogle };
  });

  it('is disabled when sign-in is blocked', () => {
    render(<GoogleSignInButton disabled onError={jest.fn()} />);
    expect(
      (screen.getByRole('button') as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('is disabled while the session is loading', () => {
    mockAuth = { loading: true, signInWithGoogle };
    render(<GoogleSignInButton onError={jest.fn()} />);
    expect(
      (screen.getByRole('button') as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('runs onBeforeSignIn before starting OAuth', async () => {
    const order: string[] = [];
    signInWithGoogle.mockImplementation(async () => {
      order.push('oauth');
    });
    render(
      <GoogleSignInButton
        onBeforeSignIn={() => order.push('before')}
        onError={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(order).toEqual(['before', 'oauth']));
  });

  it('reports errors and re-enables the button', async () => {
    signInWithGoogle.mockRejectedValue(new Error('boom'));
    const onError = jest.fn();
    render(<GoogleSignInButton onError={onError} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(onError).toHaveBeenCalledWith('boom'));
    expect(
      (screen.getByRole('button') as HTMLButtonElement).disabled
    ).toBe(false);
  });
});
