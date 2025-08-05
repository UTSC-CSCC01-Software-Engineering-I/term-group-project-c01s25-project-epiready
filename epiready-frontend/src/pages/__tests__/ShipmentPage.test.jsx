// Mock LoggedIn and Socket modules before any imports
jest.mock('../../LoggedIn', () => ({
  useGlobal: () => ({
    loggedIn: true,
    setLoggedIn: jest.fn(),
  }),
}));
jest.mock('../../Socket', () => ({
  useSocket: () => ({
    on: jest.fn(),
    off: jest.fn(),
  }),
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShipmentPage from '../ShipmentPage';
import { BrowserRouter } from 'react-router-dom';

const mockShipmentDetails = {
  id: 'shipment-1',
  name: 'Test Shipment',
  current_location: 'Toronto',
  risk_factor: 'Medium',
  origin: 'Toronto',
  destination: 'Montreal',
  product_type: 'Vaccine',
  mode_of_transport: 'Truck',
  min_temp: 2,
  max_temp: 8,
  humidity_sensitivity: 60,
  aqi_sensitivity: 50,
};

const mockWeatherData = {
  all: [
    {
      temperature: { internal: 4, external: 5, timestamp: '2025-07-20T10:00:00Z' },
      humidity: { humidity: 55, timestamp: '2025-07-20T10:00:00Z' },
      aqi: 40,
      location: 'Toronto',
      id: 'weather-1',
    },
    {
      temperature: { internal: 5, external: 6, timestamp: '2025-07-20T11:00:00Z' },
      humidity: { humidity: 60, timestamp: '2025-07-20T11:00:00Z' },
      aqi: 42,
      location: 'Montreal',
      id: 'weather-2',
    },
  ],
};

const mockActionHistory = [
  {
    id: 'action-1',
    action_type: 'status_update',
    description: 'Shipment picked up',
    status: 'completed',
    created_at: '2025-07-20T09:00:00Z',
    completed_at: '2025-07-20T09:30:00Z',
    action_metadata: { note: 'On time' },
  },
  {
    id: 'action-2',
    action_type: 'location_update',
    description: 'Arrived at hub',
    status: 'in_progress',
    created_at: '2025-07-20T10:00:00Z',
    completed_at: null,
    action_metadata: null,
  },
];

// Polyfill fetch if not present, then mock fetch
beforeEach(() => {
  if (!globalThis.fetch) {
    globalThis.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) });
  }
  jest.spyOn(globalThis, 'fetch').mockImplementation((url) => {
    if (url.includes('/api/shipments/') && url.includes('/weather')) {
      return Promise.resolve({ json: () => Promise.resolve(mockWeatherData) });
    }
    if (url.includes('/api/shipments/') && url.includes('/actions')) {
      return Promise.resolve({ json: () => Promise.resolve(mockActionHistory), status: 200 });
    }
    if (url.includes('/api/shipments/')) {
      return Promise.resolve({ json: () => Promise.resolve(mockShipmentDetails) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
});
afterEach(() => {
  jest.restoreAllMocks();
});

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('ShipmentPage', () => {
  it('renders action history tab and displays actions', async () => {
    renderWithRouter(<ShipmentPage />);
    // Wait for shipment details and weather data to load
    await waitFor(() => expect(screen.getByText('Test Shipment')).toBeInTheDocument());
    // Switch to history tab
    fireEvent.click(screen.getByText('History'));
    // Wait for action history to load
    await waitFor(() => expect(screen.getByText('Action History')).toBeInTheDocument());
    // Check for action items
    expect(screen.getByText('Shipment picked up')).toBeInTheDocument();
    expect(screen.getByText('Arrived at hub')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('in_progress')).toBeInTheDocument();
  });

  it('renders graph tab and displays temperature/humidity charts', async () => {
    renderWithRouter(<ShipmentPage />);
    // Wait for shipment details and weather data to load
    await waitFor(() => expect(screen.getByText('Test Shipment')).toBeInTheDocument());
    // Switch to history tab
    try {
      fireEvent.click(screen.getByText('Graphs'));
    } catch (e) {
        console.error(e instanceof AggregateError ? e.errors : e);
    }
    fireEvent.click(screen.getByText('Graphs'));
    // Wait for analytics dashboard
    await waitFor(() => expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument());
    // Check for chart headers
    expect(screen.getByText('Temperature Monitoring (°C)')).toBeInTheDocument();
    expect(screen.getByText('Humidity Levels (%)')).toBeInTheDocument();
  });
});
