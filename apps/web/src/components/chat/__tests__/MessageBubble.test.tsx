import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageStatus, SenderRole } from '@amira/shared';
import type { IChatMessage } from '@amira/shared';

function makeMessage(overrides: Partial<IChatMessage> = {}): IChatMessage {
  return {
    _id: 'msg-1',
    roomId: 'room-1',
    senderId: 'user-1',
    senderRole: SenderRole.CUSTOMER,
    content: 'Hello there',
    attachments: [],
    status: MessageStatus.SENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as IChatMessage;
}

describe('MessageBubble', () => {
  it('should render message content', () => {
    render(<MessageBubble message={makeMessage({ content: 'Test message' })} isOwn={false} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should show "You" label for own messages', () => {
    render(<MessageBubble message={makeMessage()} isOwn={true} />);
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('should show "Support" label for received messages', () => {
    render(<MessageBubble message={makeMessage()} isOwn={false} />);
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('should right-align own messages', () => {
    const { container } = render(<MessageBubble message={makeMessage()} isOwn={true} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-end');
  });

  it('should left-align received messages', () => {
    const { container } = render(<MessageBubble message={makeMessage()} isOwn={false} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-start');
  });

  it('should show status icon for own messages only', () => {
    const { container: ownContainer } = render(
      <MessageBubble message={makeMessage({ status: MessageStatus.READ })} isOwn={true} />,
    );
    // Own message should have an SVG status icon
    const ownSvgs = ownContainer.querySelectorAll('svg');
    expect(ownSvgs.length).toBeGreaterThan(0);

    const { container: otherContainer } = render(
      <MessageBubble message={makeMessage({ status: MessageStatus.READ })} isOwn={false} />,
    );
    // Received message should not have the blue read status icon
    const readSpan = otherContainer.querySelector('.text-blue-400');
    expect(readSpan).toBeNull();
  });

  it('should display read status with blue color', () => {
    const { container } = render(
      <MessageBubble message={makeMessage({ status: MessageStatus.READ })} isOwn={true} />,
    );
    const readIcon = container.querySelector('[title="Read"]');
    expect(readIcon).toBeInTheDocument();
    expect(readIcon?.className).toContain('text-blue-400');
  });

  it('should display delivered status', () => {
    const { container } = render(
      <MessageBubble message={makeMessage({ status: MessageStatus.DELIVERED })} isOwn={true} />,
    );
    const deliveredIcon = container.querySelector('[title="Delivered"]');
    expect(deliveredIcon).toBeInTheDocument();
  });

  it('should display sent status', () => {
    const { container } = render(
      <MessageBubble message={makeMessage({ status: MessageStatus.SENT })} isOwn={true} />,
    );
    const sentIcon = container.querySelector('[title="Sent"]');
    expect(sentIcon).toBeInTheDocument();
  });

  it('should render image attachments', () => {
    const msg = makeMessage({
      attachments: [{ type: 'image', url: 'https://example.com/img.webp' }],
    });

    render(<MessageBubble message={msg} isOwn={false} />);
    const img = screen.getByAltText('attachment');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/img.webp');
  });

  it('should show "now" for very recent messages', () => {
    const msg = makeMessage({ createdAt: new Date().toISOString() });
    render(<MessageBubble message={msg} isOwn={false} />);
    expect(screen.getByText('now')).toBeInTheDocument();
  });
});
