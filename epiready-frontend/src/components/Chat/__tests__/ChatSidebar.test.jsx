import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatSidebar from '../ChatSidebar';

const mockChatRooms = [
  {
    id: 1,
    name: 'Team Alpha',
    room_type: 'group',
    message_count: 12,
  },
  {
    id: 2,
    name: 'Project Beta',
    room_type: 'group',
    message_count: 5,
  },
  {
    id: 3,
    name: null,
    room_type: 'direct',
    message_count: 3,
  },
];

describe('ChatSidebar', () => {
  const mockProps = {
    chatRooms: mockChatRooms,
    selectedRoom: null,
    onRoomSelect: jest.fn(),
    onCreateChat: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sidebar header with title and create button', () => {
    render(<ChatSidebar {...mockProps} />);

    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
  });

  it('displays loading state when loading is true', () => {
    render(<ChatSidebar {...mockProps} loading={true} />);

    expect(screen.getByText('Loading chats...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+' })).toBeDisabled();
  });

  it('renders all chat rooms correctly', () => {
    render(<ChatSidebar {...mockProps} />);

    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
    expect(screen.getByText('Direct Message')).toBeInTheDocument();
  });

  it('displays correct room types', () => {
    render(<ChatSidebar {...mockProps} />);

    const groupLabels = screen.getAllByText('Group');
    const directLabel = screen.getByText('Direct');

    expect(groupLabels).toHaveLength(2);
    expect(directLabel).toBeInTheDocument();
  });

  it('shows message counts for rooms with messages', () => {
    render(<ChatSidebar {...mockProps} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('highlights selected room', () => {
    const selectedRoom = mockChatRooms[0];
    render(<ChatSidebar {...mockProps} selectedRoom={selectedRoom} />);

    const selectedRoomElement = screen.getByText('Team Alpha').closest('div');
    expect(selectedRoomElement).toHaveClass('selected');
  });

  it('calls onRoomSelect when a room is clicked', () => {
    render(<ChatSidebar {...mockProps} />);

    const roomElement = screen.getByText('Team Alpha');
    fireEvent.click(roomElement);

    expect(mockProps.onRoomSelect).toHaveBeenCalledWith(mockChatRooms[0]);
  });

  it('calls onCreateChat when create button is clicked', () => {
    render(<ChatSidebar {...mockProps} />);

    const createButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(createButton);

    expect(mockProps.onCreateChat).toHaveBeenCalled();
  });

  it('displays "No chats yet" message when no rooms exist', () => {
    render(<ChatSidebar {...mockProps} chatRooms={[]} />);

    expect(screen.getByText('No chats yet')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
  });

  it('calls onCreateChat when "Start a conversation" button is clicked', () => {
    render(<ChatSidebar {...mockProps} chatRooms={[]} />);

    const startChatButton = screen.getByRole('button', { name: 'Start a conversation' });
    fireEvent.click(startChatButton);

    expect(mockProps.onCreateChat).toHaveBeenCalled();
  });

  it('displays correct icons for different room types', () => {
    render(<ChatSidebar {...mockProps} />);

    // Check for group chat icons (👥)
    const groupIcons = screen.getAllByText('👥');
    expect(groupIcons).toHaveLength(2);

    // Check for direct message icon (👤)
    const directIcon = screen.getByText('👤');
    expect(directIcon).toBeInTheDocument();
  });

  it('handles rooms without message counts', () => {
    const roomsWithoutCounts = [
      {
        id: 1,
        name: 'Empty Room',
        room_type: 'group',
        message_count: 0,
      },
    ];

    render(<ChatSidebar {...mockProps} chatRooms={roomsWithoutCounts} />);

    expect(screen.getByText('Empty Room')).toBeInTheDocument();
    // Message count of 0 should not be displayed
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('displays group name for group chats', () => {
    render(<ChatSidebar {...mockProps} />);

    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
  });

  it('displays "Direct Message" for direct chats without specific names', () => {
    render(<ChatSidebar {...mockProps} />);

    // Direct chats should show "Direct Message" as display name
    expect(screen.getByText('Direct Message')).toBeInTheDocument();
  });

  it('handles empty room selection state correctly', () => {
    render(<ChatSidebar {...mockProps} selectedRoom={null} />);

    // No room should have the selected class
    const roomElements = screen.getAllByText(/Team Alpha|Project Beta|Direct Message/);
    roomElements.forEach(element => {
      const roomDiv = element.closest('div');
      expect(roomDiv).not.toHaveClass('selected');
    });
  });

  it('maintains accessibility with proper button roles', () => {
    render(<ChatSidebar {...mockProps} />);

    const createButton = screen.getByRole('button', { name: '+' });
    expect(createButton).toHaveAttribute('title', 'New Chat');
  });
});
