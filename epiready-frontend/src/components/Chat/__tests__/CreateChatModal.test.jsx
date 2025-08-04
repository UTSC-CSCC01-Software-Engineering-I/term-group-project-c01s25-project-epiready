import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateChatModal from '../CreateChatModal';

const mockUsers = [
  {
    id: 1,
    email: 'user1@example.com',
    role: 'admin',
  },
  {
    id: 2,
    email: 'user2@example.com',
    role: 'user',
  },
  {
    id: 3,
    email: 'user3@example.com',
    role: 'moderator',
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
});

afterEach(() => {
  jest.restoreAllMocks();
  sessionStorage.clear();
});

describe('CreateChatModal', () => {
  const mockProps = {
    onClose: jest.fn(),
    onChatCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch responses
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      });
  });

  it('renders modal with header and close button', async () => {
    render(<CreateChatModal {...mockProps} />);

    expect(screen.getByText('Create New Chat')).toBeInTheDocument();
    expect(screen.getByText('×')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(<CreateChatModal {...mockProps} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', async () => {
    render(<CreateChatModal {...mockProps} />);

    const overlay = document.querySelector('.modal-overlay');
    fireEvent.click(overlay);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('does not close when modal content is clicked', async () => {
    render(<CreateChatModal {...mockProps} />);

    const modalContent = document.querySelector('.modal-content');
    fireEvent.click(modalContent);

    expect(mockProps.onClose).not.toHaveBeenCalled();
  });

  it('renders chat type selector with radio buttons', async () => {
    render(<CreateChatModal {...mockProps} />);

    expect(screen.getByLabelText('Direct Message')).toBeInTheDocument();
    expect(screen.getByLabelText('Group Chat')).toBeInTheDocument();
    
    // Direct message should be selected by default
    expect(screen.getByLabelText('Direct Message')).toBeChecked();
    expect(screen.getByLabelText('Group Chat')).not.toBeChecked();
  });

  it('switches between direct and group chat types', async () => {
    render(<CreateChatModal {...mockProps} />);

    const groupChatRadio = screen.getByLabelText('Group Chat');
    fireEvent.click(groupChatRadio);

    expect(screen.getByLabelText('Group Chat')).toBeChecked();
    expect(screen.getByLabelText('Direct Message')).not.toBeChecked();
  });

  it('shows group name input when group chat is selected', async () => {
    render(<CreateChatModal {...mockProps} />);

    const groupChatRadio = screen.getByLabelText('Group Chat');
    fireEvent.click(groupChatRadio);

    await waitFor(() => {
      expect(screen.getByLabelText('Group Name:')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter group name')).toBeInTheDocument();
    });
  });

  it('hides group name input when direct chat is selected', async () => {
    render(<CreateChatModal {...mockProps} />);

    // Switch to group first
    const groupChatRadio = screen.getByLabelText('Group Chat');
    fireEvent.click(groupChatRadio);

    await waitFor(() => {
      expect(screen.getByLabelText('Group Name:')).toBeInTheDocument();
    });

    // Switch back to direct
    const directChatRadio = screen.getByLabelText('Direct Message');
    fireEvent.click(directChatRadio);

    await waitFor(() => {
      expect(screen.queryByLabelText('Group Name:')).not.toBeInTheDocument();
    });
  });

  it('fetches and displays users', async () => {
    render(<CreateChatModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('user3@example.com')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat/users'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer mocktoken',
        },
      })
    );
  });

  it('displays user roles correctly', async () => {
    render(<CreateChatModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('moderator')).toBeInTheDocument();
    });
  });

  it('allows selecting users for direct chat (radio buttons)', async () => {
    render(<CreateChatModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });

    const user2Checkbox = screen.getByDisplayValue('2');
    fireEvent.click(user2Checkbox);

    expect(user2Checkbox).toBeChecked();
  });

  it('allows selecting multiple users for group chat (checkboxes)', async () => {
    render(<CreateChatModal {...mockProps} />);

    // Switch to group chat
    const groupChatRadio = screen.getByLabelText('Group Chat');
    fireEvent.click(groupChatRadio);

    await waitFor(() => {
      expect(screen.getByText('Select Participants:')).toBeInTheDocument();
    });

    // Select multiple users
    const user2Checkbox = screen.getAllByRole('checkbox')[1]; // Skip the radio buttons
    const user3Checkbox = screen.getAllByRole('checkbox')[2];

    fireEvent.click(user2Checkbox);
    fireEvent.click(user3Checkbox);

    expect(user2Checkbox).toBeChecked();
    expect(user3Checkbox).toBeChecked();
  });

  it('handles group name input', async () => {
    render(<CreateChatModal {...mockProps} />);

    // Switch to group chat
    const groupChatRadio = screen.getByLabelText('Group Chat');
    fireEvent.click(groupChatRadio);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter group name')).toBeInTheDocument();
    });

    const groupNameInput = screen.getByPlaceholderText('Enter group name');
    fireEvent.change(groupNameInput, { target: { value: 'Test Group' } });

    expect(groupNameInput.value).toBe('Test Group');
  });

  it('creates direct chat successfully', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: null, room_type: 'direct' }),
      });

    render(<CreateChatModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });

    // Select a user
    const userItem = screen.getByText('user2@example.com').closest('div');
    fireEvent.click(userItem);

    // Click create button
    const createButton = screen.getByText('Create Chat');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/direct'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mocktoken',
          },
          body: JSON.stringify({ other_user_id: 2 }),
        })
      );
    });

    expect(mockProps.onChatCreated).toHaveBeenCalledWith({ id: 1, name: null, room_type: 'direct' });
  });

  it('creates group chat successfully', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 2, name: 'Test Group', room_type: 'group' }),
      });

    render(<CreateChatModal {...mockProps} />);

    // Switch to group chat
    const groupChatRadio = screen.getByLabelText('Group Chat');
    fireEvent.click(groupChatRadio);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter group name')).toBeInTheDocument();
    });

    // Enter group name
    const groupNameInput = screen.getByPlaceholderText('Enter group name');
    fireEvent.change(groupNameInput, { target: { value: 'Test Group' } });

    // Select users
    const user2Item = screen.getByText('user2@example.com').closest('div');
    const user3Item = screen.getByText('user3@example.com').closest('div');
    fireEvent.click(user2Item);
    fireEvent.click(user3Item);

    // Click create button
    const createButton = screen.getByText('Create Chat');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/group'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mocktoken',
          },
          body: JSON.stringify({
            name: 'Test Group',
            participant_ids: [2, 3],
          }),
        })
      );
    });

    expect(mockProps.onChatCreated).toHaveBeenCalledWith({ id: 2, name: 'Test Group', room_type: 'group' });
  });

  it('shows validation error for direct chat without user selection', async () => {
    window.alert = jest.fn();

    render(<CreateChatModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Create Chat')).toBeInTheDocument();
    });

    // Try to create without selecting a user
    const createButton = screen.getByText('Create Chat');
    fireEvent.click(createButton);

    expect(window.alert).toHaveBeenCalledWith('Please select exactly one user for direct chat');
  });

  it('shows validation error for group chat without name or participants', async () => {
    window.alert = jest.fn();

    render(<CreateChatModal {...mockProps} />);

    // Switch to group chat
    const groupChatRadio = screen.getByLabelText('Group Chat');
    fireEvent.click(groupChatRadio);

    await waitFor(() => {
      expect(screen.getByText('Create Chat')).toBeInTheDocument();
    });

    // Try to create without group name or participants
    const createButton = screen.getByText('Create Chat');
    fireEvent.click(createButton);

    expect(window.alert).toHaveBeenCalledWith('Please provide a group name and select at least one participant');
  });

  it('handles API errors gracefully', async () => {
    window.alert = jest.fn();

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Chat creation failed' }),
      });

    render(<CreateChatModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });

    // Select a user
    const userItem = screen.getByText('user2@example.com').closest('div');
    fireEvent.click(userItem);

    // Click create button
    const createButton = screen.getByText('Create Chat');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Chat creation failed');
    });
  });

  it('disables create button with appropriate conditions', async () => {
    render(<CreateChatModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Create Chat')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create Chat');
    
    // Should be disabled initially (no user selected for direct chat)
    expect(createButton).toBeDisabled();

    // Select a user
    const userItem = screen.getByText('user2@example.com').closest('div');
    fireEvent.click(userItem);

    // Should be enabled now
    expect(createButton).not.toBeDisabled();
  });

  it('shows loading state during chat creation', async () => {
    // Mock a slow response
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<CreateChatModal {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });

    // Select a user and create chat
    const userItem = screen.getByText('user2@example.com').closest('div');
    fireEvent.click(userItem);
    
    const createButton = screen.getByText('Create Chat');
    fireEvent.click(createButton);

    // Check for loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });
});
