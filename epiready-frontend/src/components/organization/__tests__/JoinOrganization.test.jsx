import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JoinOrganizationPopup from '../JoinOrganization';

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn();
  sessionStorage.setItem('token', 'Bearer mocktoken');
});

afterEach(() => {
  jest.restoreAllMocks();
  sessionStorage.clear();
});

describe('JoinOrganizationPopup', () => {
  const mockProps = {
    trigger: <button>Join Organization</button>,
    onOrganizationJoined: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(<JoinOrganizationPopup {...mockProps} />);

    expect(screen.getByText('Join Organization')).toBeInTheDocument();
  });

  it('opens modal when trigger is clicked', () => {
    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    expect(screen.getByText('Join Organization')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Join Code')).toBeInTheDocument();
  });

  it('renders form field correctly', () => {
    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    expect(screen.getByPlaceholderText('Enter Join Code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join Organization' })).toBeInTheDocument();
  });

  it('has close button that closes the modal', () => {
    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    // Modal should be closed, so we shouldn't see the form field
    expect(screen.queryByPlaceholderText('Enter Join Code')).not.toBeInTheDocument();
  });

  it('requires join code input', () => {
    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    expect(joinCodeInput).toBeRequired();
  });

  it('handles successful organization joining', async () => {
    const mockOrganization = {
      id: 1,
      name: 'Test Organization',
      join_code: 'TEST123',
    };

    const mockResponse = {
      organization: mockOrganization,
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    const joinButton = screen.getByRole('button', { name: 'Join Organization' });

    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/join-organization'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mocktoken',
          },
          body: JSON.stringify({
            join_code: 'TEST123',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Successfully joined organization!')).toBeInTheDocument();
    });

    expect(mockProps.onOrganizationJoined).toHaveBeenCalledWith(mockOrganization);
  });

  it('handles API error responses', async () => {
    const errorResponse = {
      error: 'Invalid join code',
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(errorResponse),
    });

    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    const joinButton = screen.getByRole('button', { name: 'Join Organization' });

    fireEvent.change(joinCodeInput, { target: { value: 'INVALID123' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid join code')).toBeInTheDocument();
    });

    // Should display error message in red
    const errorElement = screen.getByText('Invalid join code');
    expect(errorElement).toHaveClass('text-red-500');
  });

  it('handles network errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    const joinButton = screen.getByRole('button', { name: 'Join Organization' });

    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText('Network error. Please check your internet connection and try again.')).toBeInTheDocument();
    });
  });

  it('handles JSON parsing errors', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    const joinButton = screen.getByRole('button', { name: 'Join Organization' });

    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText(/Something unexpected happened/)).toBeInTheDocument();
    });
  });

  it('clears form input when switching between different modal instances', () => {
    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });

    // Close and reopen
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    fireEvent.click(triggerButton);

    // Input should be empty (form should reset)
    const newJoinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    expect(newJoinCodeInput.value).toBe('');
  });

  it('prevents submission with empty join code', () => {
    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinButton = screen.getByRole('button', { name: 'Join Organization' });
    fireEvent.click(joinButton);

    // Should not call fetch if join code is empty
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows success message with proper styling', async () => {
    const mockResponse = {
      organization: {
        id: 1,
        name: 'Test Organization',
        join_code: 'TEST123',
      },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    const joinButton = screen.getByRole('button', { name: 'Join Organization' });

    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      const successMessage = screen.getByText('Successfully joined organization!');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveClass('text-green-500');
    });
  });

  it('handles organization joining without callback', async () => {
    const mockResponse = {
      organization: {
        id: 1,
        name: 'Test Organization',
        join_code: 'TEST123',
      },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    // Render without onOrganizationJoined callback
    render(<JoinOrganizationPopup trigger={<button>Join Organization</button>} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    const joinButton = screen.getByRole('button', { name: 'Join Organization' });

    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText('Successfully joined organization!')).toBeInTheDocument();
    });

    // Should not throw error when callback is not provided
  });

  it('maintains proper modal overlay styling', () => {
    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    // Check for modal structure
    expect(screen.getByRole('dialog', { hidden: true }) || document.querySelector('.popup-overlay')).toBeInTheDocument();
  });

  it('handles form submission via Enter key', async () => {
    const mockResponse = {
      organization: {
        id: 1,
        name: 'Test Organization',
        join_code: 'TEST123',
      },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });

    // Submit form via Enter key
    fireEvent.submit(joinCodeInput.closest('form'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('logs response status to console', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        organization: { id: 1, name: 'Test Org', join_code: 'TEST123' }
      }),
    });

    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    const joinButton = screen.getByRole('button', { name: 'Join Organization' });

    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Join organization response status: 200');
    });

    consoleSpy.mockRestore();
  });

  it('handles whitespace in join code input', async () => {
    const mockResponse = {
      organization: {
        id: 1,
        name: 'Test Organization',
        join_code: 'TEST123',
      },
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    const joinButton = screen.getByRole('button', { name: 'Join Organization' });

    // Enter join code with leading/trailing whitespace
    fireEvent.change(joinCodeInput, { target: { value: '  TEST123  ' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/join-organization'),
        expect.objectContaining({
          body: JSON.stringify({
            join_code: '  TEST123  ', // Should preserve whitespace as entered
          }),
        })
      );
    });
  });

  it('handles concurrent join attempts gracefully', async () => {
    const mockResponse = {
      organization: {
        id: 1,
        name: 'Test Organization',
        join_code: 'TEST123',
      },
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<JoinOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Join Organization');
    fireEvent.click(triggerButton);

    const joinCodeInput = screen.getByPlaceholderText('Enter Join Code');
    const joinButton = screen.getByRole('button', { name: 'Join Organization' });

    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });

    // Simulate rapid clicking
    fireEvent.click(joinButton);
    fireEvent.click(joinButton);
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText('Successfully joined organization!')).toBeInTheDocument();
    });

    // Should handle multiple clicks gracefully without errors
  });
});
