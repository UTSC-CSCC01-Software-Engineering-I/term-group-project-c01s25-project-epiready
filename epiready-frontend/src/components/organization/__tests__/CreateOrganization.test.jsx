import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateOrganizationPopup from '../CreateOrganization';

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn();
  sessionStorage.setItem('token', 'Bearer mocktoken');
});

afterEach(() => {
  jest.restoreAllMocks();
  sessionStorage.clear();
});

describe('CreateOrganizationPopup', () => {
  const mockProps = {
    trigger: <button>Create Organization</button>,
    onOrganizationCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(<CreateOrganizationPopup {...mockProps} />);

    expect(screen.getByText('Create Organization')).toBeInTheDocument();
  });

  it('opens modal when trigger is clicked', () => {
    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    expect(screen.getByText('Create Organization')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Organization Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Join Code')).toBeInTheDocument();
  });

  it('renders form fields correctly', () => {
    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    expect(screen.getByPlaceholderText('Organization Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Join Code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Organization' })).toBeInTheDocument();
  });

  it('has close button that closes the modal', () => {
    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    // Modal should be closed, so we shouldn't see the form fields
    expect(screen.queryByPlaceholderText('Organization Name')).not.toBeInTheDocument();
  });

  it('requires both organization name and join code', () => {
    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('Organization Name');
    const joinCodeInput = screen.getByPlaceholderText('Join Code');

    expect(nameInput).toBeRequired();
    expect(joinCodeInput).toBeRequired();
  });

  it('handles successful organization creation', async () => {
    const mockResponse = {
      id: 1,
      name: 'Test Organization',
      join_code: 'TEST123',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('Organization Name');
    const joinCodeInput = screen.getByPlaceholderText('Join Code');
    const createButton = screen.getByRole('button', { name: 'Create Organization' });

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/create-organization'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mocktoken',
          },
          body: JSON.stringify({
            name: 'Test Organization',
            join_code: 'TEST123',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Organization created successfully!')).toBeInTheDocument();
    });

    expect(mockProps.onOrganizationCreated).toHaveBeenCalledWith(mockResponse);
  });

  it('handles API error responses', async () => {
    const errorResponse = {
      error: 'Organization name already exists',
    };

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(errorResponse),
    });

    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('Organization Name');
    const joinCodeInput = screen.getByPlaceholderText('Join Code');
    const createButton = screen.getByRole('button', { name: 'Create Organization' });

    fireEvent.change(nameInput, { target: { value: 'Existing Organization' } });
    fireEvent.change(joinCodeInput, { target: { value: 'EXIST123' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Organization name already exists')).toBeInTheDocument();
    });

    // Should display error message in red
    const errorElement = screen.getByText('Organization name already exists');
    expect(errorElement).toHaveClass('text-red-500');
  });

  it('handles network errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('Organization Name');
    const joinCodeInput = screen.getByPlaceholderText('Join Code');
    const createButton = screen.getByRole('button', { name: 'Create Organization' });

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Network error. Please check your internet connection and try again.')).toBeInTheDocument();
    });
  });

  it('handles JSON parsing errors', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('Organization Name');
    const joinCodeInput = screen.getByPlaceholderText('Join Code');
    const createButton = screen.getByRole('button', { name: 'Create Organization' });

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Something unexpected happened/)).toBeInTheDocument();
    });
  });

  it('clears form inputs when switching between different modal instances', () => {
    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('Organization Name');
    const joinCodeInput = screen.getByPlaceholderText('Join Code');

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });

    // Close and reopen
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    fireEvent.click(triggerButton);

    // Inputs should be empty (form should reset)
    const newNameInput = screen.getByPlaceholderText('Organization Name');
    const newJoinCodeInput = screen.getByPlaceholderText('Join Code');

    expect(newNameInput.value).toBe('');
    expect(newJoinCodeInput.value).toBe('');
  });

  it('prevents submission with empty fields', () => {
    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const createButton = screen.getByRole('button', { name: 'Create Organization' });
    fireEvent.click(createButton);

    // Should not call fetch if required fields are empty
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows success message with proper styling', async () => {
    const mockResponse = {
      id: 1,
      name: 'Test Organization',
      join_code: 'TEST123',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('Organization Name');
    const joinCodeInput = screen.getByPlaceholderText('Join Code');
    const createButton = screen.getByRole('button', { name: 'Create Organization' });

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      const successMessage = screen.getByText('Organization created successfully!');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveClass('text-green-500');
    });
  });

  it('maintains proper modal overlay styling', () => {
    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    // Check for modal structure
    expect(screen.getByRole('dialog', { hidden: true }) || document.querySelector('.popup-overlay')).toBeInTheDocument();
  });

  it('handles form submission via Enter key', async () => {
    const mockResponse = {
      id: 1,
      name: 'Test Organization',
      join_code: 'TEST123',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('Organization Name');
    const joinCodeInput = screen.getByPlaceholderText('Join Code');

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });

    // Submit form via Enter key
    fireEvent.submit(nameInput.closest('form'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('logs response status to console', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 1, name: 'Test Org', join_code: 'TEST123' }),
    });

    render(<CreateOrganizationPopup {...mockProps} />);

    const triggerButton = screen.getByText('Create Organization');
    fireEvent.click(triggerButton);

    const nameInput = screen.getByPlaceholderText('Organization Name');
    const joinCodeInput = screen.getByPlaceholderText('Join Code');
    const createButton = screen.getByRole('button', { name: 'Create Organization' });

    fireEvent.change(nameInput, { target: { value: 'Test Org' } });
    fireEvent.change(joinCodeInput, { target: { value: 'TEST123' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Create organization response status: 201');
    });

    consoleSpy.mockRestore();
  });
});
