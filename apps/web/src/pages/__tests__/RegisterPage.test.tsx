import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils';
import RegisterPage from '@/pages/RegisterPage';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterPage', () => {
  const user = userEvent.setup();

  it('should render registration form', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', async () => {
    render(<RegisterPage />);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid email', async () => {
    render(<RegisterPage />);
    await user.type(screen.getByLabelText('Email'), 'bad-email');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should show password requirements errors', async () => {
    render(<RegisterPage />);
    await user.type(screen.getByLabelText('Full Name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'weak');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    render(<RegisterPage />);
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show/i });
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('should have link to login page', () => {
    render(<RegisterPage />);
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
