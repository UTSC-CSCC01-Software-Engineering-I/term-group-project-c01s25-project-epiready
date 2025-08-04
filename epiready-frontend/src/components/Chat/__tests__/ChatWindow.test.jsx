// Mock LoggedIn module
jest.mock('../../../LoggedIn', () => ({
  useGlobal: () => ({
    loggedIn: true,
  }),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from '../ChatWindow';

const mockSelectedRoom = {
  id: 1,
  name: 'Test Chat Room',
  room_type: 'group',
};

const mockDirectRoom = {
  id: 2,
  name: null,
  room_type: 'direct',
};

const mockMessages = [
  {
    id: 1,
    content: 'Hello everyone!',
    sender_id: 1,
    sender_email: 'user1@example.com',
    created_at: '2025-01-20T10:00:00Z',
    is_deleted: false,
    is_edited: false,
  },
  {
    id: 2,
    content: 'How is everyone doing?',
    sender_id: 2,
    sender_email: 'user2@example.com',
    created_at: '2025-01-20T10:05:00Z',
    is_deleted: false,
    is_edited: true,
  },
  {
    id: 3,
    content: 'This message was deleted',
    sender_id: 1,
    sender_email: 'user1@example.com',
    created_at: '2025-01-20T10:10:00Z',
    is_deleted: true,
    is_edited: false,
  },
];

const mockCurrentUser = {
  id: 1,
  email: 'user1@example.com',
};

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn();
  sessionStorage.setItem('token', 'Bearer mocktoken');
  
  // Mock scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  sessionStorage.clear();
});

describe('ChatWindow', () => {
  const mockProps = {
    selectedRoom: mockSelectedRoom,
    messages: mockMessages,
    onSendMessage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch for current user
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCurrentUser),
    });
  });

  it('displays welcome message when no room is selected', () => {
    render(<ChatWindow {...mockProps} selectedRoom={null} />);

    expect(screen.getByText('Welcome to EpiReady Chat')).toBeInTheDocument();
    expect(screen.getByText('Select a chat from the sidebar to start messaging')).toBeInTheDocument();
  });

  it('renders chat header with room information', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Test Chat Room')).toBeInTheDocument();
      expect(screen.getByText('Group Chat')).toBeInTheDocument();
    });
  });

  it('renders direct message header correctly', async () => {
    render(<ChatWindow {...mockProps} selectedRoom={mockDirectRoom} />);

    await waitFor(() => {
      expect(screen.getByText('Direct Message')).toBeInTheDocument();
    });
  });

  it('displays all messages correctly', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      expect(screen.getByText('How is everyone doing?')).toBeInTheDocument();
    });
  });

  it('shows deleted message placeholder', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('This message was deleted')).toBeInTheDocument();
    });
  });

  it('shows edited indicator for edited messages', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('(edited)')).toBeInTheDocument();
    });
  });

  it('differentiates between own and other messages', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      // User1's messages should show "Me"
      expect(screen.getAllByText('Me')).toHaveLength(2);
      // Other user's message should show their email
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });
  });

  it('formats message timestamps correctly', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      // Check if time is formatted (this will depend on locale)
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('handles message input and sending', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    // Type a message
    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(input.value).toBe('Test message');

    // Send the message
    fireEvent.click(sendButton);

    expect(mockProps.onSendMessage).toHaveBeenCalledWith('Test message');
    expect(input.value).toBe(''); // Input should be cleared
  });

  it('handles message sending via Enter key', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type a message...');

    fireEvent.change(input, { target: { value: 'Test message via Enter' } });
    fireEvent.submit(input.closest('form'));

    expect(mockProps.onSendMessage).toHaveBeenCalledWith('Test message via Enter');
  });

  it('prevents sending empty messages', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: 'Send' });

    // Try to send empty message
    fireEvent.click(sendButton);

    expect(mockProps.onSendMessage).not.toHaveBeenCalled();
  });

  it('prevents sending whitespace-only messages', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendButton);

    expect(mockProps.onSendMessage).not.toHaveBeenCalled();
  });

  it('disables input and send button when no room is selected', () => {
    render(<ChatWindow {...mockProps} selectedRoom={null} />);

    const input = screen.queryByPlaceholderText('Type a message...');
    const sendButton = screen.queryByRole('button', { name: 'Send' });

    if (input && sendButton) {
      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    }
  });

  it('displays "No messages yet" when messages array is empty', async () => {
    render(<ChatWindow {...mockProps} messages={[]} />);

    await waitFor(() => {
      expect(screen.getByText('No messages yet. Start the conversation!')).toBeInTheDocument();
    });
  });

  it('fetches current user information on mount', async () => {
    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer mocktoken',
          },
        })
      );
    });
  });

  it('handles fetch error for current user gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<ChatWindow {...mockProps} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching current user:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('scrolls to bottom when new messages are added', async () => {
    const { rerender } = render(<ChatWindow {...mockProps} />);

    // Add a new message
    const newMessages = [
      ...mockMessages,
      {
        id: 4,
        content: 'New message',
        sender_id: 2,
        sender_email: 'user2@example.com',
        created_at: '2025-01-20T10:15:00Z',
        is_deleted: false,
        is_edited: false,
      },
    ];

    rerender(<ChatWindow {...mockProps} messages={newMessages} />);

    await waitFor(() => {
      expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });

  it('handles long message content properly', async () => {
    const longMessage = {
      id: 4,
      content: 'This is a very long message that might wrap to multiple lines and should be handled properly by the chat window component without breaking the layout or functionality.',
      sender_id: 1,
      sender_email: 'user1@example.com',
      created_at: '2025-01-20T10:15:00Z',
      is_deleted: false,
      is_edited: false,
    };

    const messagesWithLongMessage = [...mockMessages, longMessage];

    render(<ChatWindow {...mockProps} messages={messagesWithLongMessage} />);

    await waitFor(() => {
      expect(screen.getByText(longMessage.content)).toBeInTheDocument();
    });
  });
});
