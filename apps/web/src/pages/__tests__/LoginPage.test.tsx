import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils';
import LoginPage from '@/pages/LoginPage';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login', search: '', hash: '', key: 'default' }),
  };
});

describe('LoginPage', () => {
  const user = userEvent.setup();

  it('should render login form with email and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginPage />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should show password minimum length error', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show/i });
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: /hide/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should have link to register page', () => {
    render(<LoginPage />);
    const registerLink = screen.getByRole('link', { name: /create one/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should have link to forgot password page', () => {
    render(<LoginPage />);
    const forgotLink = screen.getByRole('link', { name: /forgot password/i });
    expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });

  it('should submit form with valid data', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'ram@example.com');
    await user.type(passwordInput, 'ValidPass1!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // The form should submit without validation errors shown
    await waitFor(() => {
      expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
    });
  });
});
