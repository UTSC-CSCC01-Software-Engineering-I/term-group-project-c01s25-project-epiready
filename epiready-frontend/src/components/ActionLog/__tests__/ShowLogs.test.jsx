import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShowLogs from '../ShowLogs';

// Mock useGlobal to always return loggedIn true
jest.mock('../../../LoggedIn', () => ({
  useGlobal: () => ({ loggedIn: true })
}));

// Mock useSocket to avoid real socket connection
jest.mock('../../../Socket', () => ({
  useSocket: () => ({
    on: jest.fn(),
    off: jest.fn()
  })
}));

// Mock ActionLog to simplify rendering
jest.mock('../ActionLog', () => (props) => (
  <div data-testid="action-log">{props.msg}</div>
));

describe('ShowLogs', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ alerts: [{ id: 1, message: 'Alert 1', severity: 'low', shipment_name: 'S1' }], total_count: 1 }),
      })
    );
  });
  afterEach(() => {
    if (global.fetch && global.fetch.mockClear) global.fetch.mockClear();
    delete global.fetch;
  });

  it('renders loading spinner initially', async () => {
    render(<ShowLogs />);
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('renders logs after fetch', async () => {
    render(<ShowLogs />);
    expect(await screen.findByTestId('action-log')).toHaveTextContent('Alert 1');
  });

  it('shows error on fetch failure', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
    render(<ShowLogs />);
    expect(await screen.findByText(/Unable to get the alerts/i)).toBeInTheDocument();
  });

  it('calls fetch again on Retry', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
    render(<ShowLogs />);
    const retryBtn = await screen.findByText('Retry');
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ alerts: [{ id: 2, message: 'Alert 2', severity: 'low', shipment_name: 'S2' }], total_count: 1 }),
      })
    );
    fireEvent.click(retryBtn);
    expect(await screen.findByTestId('action-log')).toHaveTextContent('Alert 2');
  });

  it('shows pagination controls when logged in and isHome is false', async () => {
    render(<ShowLogs />);
    expect(await screen.findByText(/Page 1 of/)).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('does not show pagination controls when isHome is true', async () => {
    render(<ShowLogs isHome={true} />);
    // Wait for logs to render
    expect(await screen.findByTestId('action-log')).toBeInTheDocument();
    expect(screen.queryByText(/Page 1 of/)).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });
});
