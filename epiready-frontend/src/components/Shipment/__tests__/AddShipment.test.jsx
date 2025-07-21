beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ shipments: [], total_count: 0 }),
    })
  );
});

afterAll(() => {
  global.fetch.mockClear();
  delete global.fetch;
});
// Mock useGlobal to prevent destructuring error
jest.mock('../../../LoggedIn', () => ({
  useGlobal: () => ({ loggedIn: true })
}));
import React from 'react';
import AddShipmentPopup from '../AddShipment';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

test('renders Add Shipment button', () => {
  render(<AddShipmentPopup trigger={<button>Add</button>} setAdded={() => {}} />);
  expect(screen.getByText(/Add/i)).toBeInTheDocument();
});
