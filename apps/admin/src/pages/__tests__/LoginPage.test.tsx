import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils';
import { LoginPage } from '@/pages/LoginPage';

// Mock @refinedev/core's useLogin
const mockLogin = vi.fn();
vi.mock('@refinedev/core', () => ({
  useLogin: () => ({
    mutate: mockLogin,
    isLoading: false,
  }),
}));

describe('LoginPage', () => {
  const user = userEvent.setup();

  it('should render login form with title', () => {
    render(<LoginPage />);
    expect(screen.getByText('Amira Admin')).toBeInTheDocument();
    expect(screen.getByText(/sign in to the admin panel/i)).toBeInTheDocument();
  });

  it('should render email and password inputs', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should render sign in button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should allow typing email and password', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'admin@amira.com');
    await user.type(passwordInput, 'AdminPass1!');

    expect(emailInput).toHaveValue('admin@amira.com');
    expect(passwordInput).toHaveValue('AdminPass1!');
  });

  it('should call login mutation on form submit', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'admin@amira.com');
    await user.type(passwordInput, 'AdminPass1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockLogin).toHaveBeenCalledWith(
      { email: 'admin@amira.com', password: 'AdminPass1!' },
      expect.objectContaining({ onError: expect.any(Function) })
    );
  });

  it('should show error message when login fails', async () => {
    mockLogin.mockImplementation((_data: unknown, options: { onError: (err: Error) => void }) => {
      options.onError(new Error('Invalid credentials'));
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText('Email'), 'bad@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
