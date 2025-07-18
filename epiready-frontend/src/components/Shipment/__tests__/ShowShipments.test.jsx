beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ shipments: [], total_count: 0 }),
    })
  );
});

afterAll(() => {
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
  delete global.fetch;
});

let mockLoggedIn = false;
jest.mock('../../../LoggedIn', () => ({
  useGlobal: () => ({ loggedIn: mockLoggedIn })
}));

import React from 'react';
import ShowShipments from '../ShowShipments';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

describe('ShowShipments', () => {
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ shipments: [], total_count: 0 }),
      })
    );
  });

  afterAll(() => {
    if (global.fetch && global.fetch.mockClear) {
      global.fetch.mockClear();
    }
    delete global.fetch;
  });

  it('shows login prompt when not logged in', async () => {
    mockLoggedIn = false;
    render(
      <MemoryRouter>
        <ShowShipments />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Please log in to access the shipments/i)).toBeInTheDocument();
  });

  it('shows shipment UI when logged in', async () => {
    mockLoggedIn = true;
    render(
      <MemoryRouter>
        <ShowShipments />
      </MemoryRouter>
    );
    // The + button is present in the AddShipmentPopup trigger
    expect(await screen.findByText('+')).toBeInTheDocument();
  });
});


