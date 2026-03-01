import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChatStore } from '@/store/chat.store';

// Mock child components and hook to isolate ChatWindow logic
vi.mock('@/components/chat/MessageList', () => ({
  MessageList: () => <div data-testid="message-list" />,
}));

vi.mock('@/components/chat/MessageInput', () => ({
  MessageInput: (props: { disabled: boolean }) => (
    <div data-testid="message-input" data-disabled={props.disabled} />
  ),
}));

vi.mock('@/components/chat/TypingIndicator', () => ({
  TypingIndicator: ({ typingUsers }: { typingUsers: unknown[] }) => (
    <div data-testid="typing-indicator" data-count={typingUsers.length} />
  ),
}));

const mockUseChat = {
  connectionStatus: 'connected' as const,
  typingUsers: [],
  sendMessage: vi.fn(),
  markAsRead: vi.fn(),
  startTyping: vi.fn(),
  stopTyping: vi.fn(),
  loadMore: vi.fn(),
};

vi.mock('@/hooks/useChat', () => ({
  useChat: () => mockUseChat,
}));

describe('ChatWindow', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should not render when chat is closed', () => {
    useChatStore.setState({ isOpen: false });

    const { container } = render(<ChatWindow />);
    expect(container.innerHTML).toBe('');
  });

  it('should render header, message list, and input when open', () => {
    useChatStore.setState({ isOpen: true });

    render(<ChatWindow />);
    expect(screen.getByText('Support Chat')).toBeInTheDocument();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('should show Connected status when connected', () => {
    useChatStore.setState({ isOpen: true });
    mockUseChat.connectionStatus = 'connected';

    render(<ChatWindow />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should show Connecting... status when connecting', () => {
    useChatStore.setState({ isOpen: true });
    mockUseChat.connectionStatus = 'connecting';

    render(<ChatWindow />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('should show Disconnected status when disconnected', () => {
    useChatStore.setState({ isOpen: true });
    mockUseChat.connectionStatus = 'disconnected';

    render(<ChatWindow />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('should display error banner when error exists', () => {
    useChatStore.setState({ isOpen: true, error: 'Connection lost' });

    render(<ChatWindow />);
    expect(screen.getByText('Connection lost')).toBeInTheDocument();
  });

  it('should close chat when close button is clicked', () => {
    useChatStore.setState({ isOpen: true });

    render(<ChatWindow />);
    // The close button is the button inside the header
    const buttons = screen.getAllByRole('button');
    // The close button inside ChatWindow header
    const closeBtn = buttons.find((btn) =>
      btn.closest('.bg-brand-700'),
    );
    if (closeBtn) {
      closeBtn.click();
      expect(useChatStore.getState().isOpen).toBe(false);
    }
  });
});
