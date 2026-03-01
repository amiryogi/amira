import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';

// Mock ChatWindow to isolate ChatWidget tests
vi.mock('@/components/chat/ChatWindow', () => ({
  ChatWindow: () => <div data-testid="chat-window" />,
}));

describe('ChatWidget', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      accessToken: null,
      user: null,
    });
    useChatStore.getState().reset();
  });

  it('should not render when user is not authenticated', () => {
    const { container } = render(<ChatWidget />);
    expect(container.innerHTML).toBe('');
  });

  it('should render floating button when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(<ChatWidget />);
    const button = screen.getByRole('button', { name: /open chat/i });
    expect(button).toBeInTheDocument();
  });

  it('should toggle chat on button click', () => {
    useAuthStore.setState({ isAuthenticated: true });

    render(<ChatWidget />);
    const button = screen.getByRole('button', { name: /open chat/i });

    fireEvent.click(button);
    expect(useChatStore.getState().isOpen).toBe(true);

    // Button label changes when open
    const closeButton = screen.getByRole('button', { name: /close chat/i });
    fireEvent.click(closeButton);
    expect(useChatStore.getState().isOpen).toBe(false);
  });

  it('should show unread badge when there are unread messages and chat is closed', () => {
    useAuthStore.setState({ isAuthenticated: true });
    useChatStore.setState({ unreadCount: 5, isOpen: false });

    render(<ChatWidget />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should hide unread badge when chat is open', () => {
    useAuthStore.setState({ isAuthenticated: true });
    useChatStore.setState({ unreadCount: 5, isOpen: true });

    render(<ChatWidget />);
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('should cap unread display at 99+', () => {
    useAuthStore.setState({ isAuthenticated: true });
    useChatStore.setState({ unreadCount: 150, isOpen: false });

    render(<ChatWidget />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should show green status dot when connected', () => {
    useAuthStore.setState({ isAuthenticated: true });
    useChatStore.setState({ connectionStatus: 'connected' });

    render(<ChatWidget />);
    const dot = document.querySelector('.bg-green-400');
    expect(dot).toBeInTheDocument();
  });
});
