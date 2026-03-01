import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ChatScreen } from '@/screens/user/ChatScreen';

// Mock all external dependencies
jest.mock('@react-navigation/elements', () => ({
  useHeaderHeight: () => 44,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: [],
    connectionStatus: 'connected',
    typingUsers: [],
    hasMoreMessages: false,
    isLoading: false,
    error: null,
    sendMessage: jest.fn(),
    startTyping: jest.fn(),
    loadMore: jest.fn(),
  }),
}));

jest.mock('@/components/chat/MessageBubble', () => ({
  MessageBubble: () => 'MessageBubble',
}));

jest.mock('@/components/chat/MessageInput', () => ({
  MessageInput: () => 'MessageInput',
}));

jest.mock('@/components/chat/TypingIndicator', () => ({
  TypingIndicator: () => null,
}));

jest.mock('@/components/chat/ConnectionBanner', () => ({
  ConnectionBanner: () => null,
}));

jest.mock('@/components/Button', () => ({
  Button: () => 'Button',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ChatScreen', () => {
  it('should render empty state with prompt text', () => {
    render(<ChatScreen />);
    expect(screen.getByText('Send a message to start chatting')).toBeTruthy();
  });

  it('should render loading state when loading with no messages', () => {
    const useChatModule = require('@/hooks/useChat');
    useChatModule.useChat = () => ({
      messages: [],
      connectionStatus: 'connecting',
      typingUsers: [],
      hasMoreMessages: false,
      isLoading: true,
      error: null,
      sendMessage: jest.fn(),
      startTyping: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<ChatScreen />);
    expect(screen.getByText('Loading chat...')).toBeTruthy();
  });

  it('should render error state when error occurs with no messages', () => {
    const useChatModule = require('@/hooks/useChat');
    useChatModule.useChat = () => ({
      messages: [],
      connectionStatus: 'disconnected',
      typingUsers: [],
      hasMoreMessages: false,
      isLoading: false,
      error: 'Connection failed',
      sendMessage: jest.fn(),
      startTyping: jest.fn(),
      loadMore: jest.fn(),
    });

    render(<ChatScreen />);
    expect(screen.getByText('Connection failed')).toBeTruthy();
  });
});
