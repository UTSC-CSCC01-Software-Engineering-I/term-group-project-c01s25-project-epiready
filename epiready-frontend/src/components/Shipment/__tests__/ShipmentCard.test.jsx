// Mock useGlobal to prevent destructuring error
jest.mock('../../../LoggedIn', () => ({
  useGlobal: () => ({ loggedIn: true })
}));

import React from 'react';
import ShipmentCard from '../ShipmentCard';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

test('renders shipment name', () => {
  render(
    <MemoryRouter>
      <ShipmentCard shipment={{ id: '1', name: 'Test Shipment' }} />
    </MemoryRouter>
  );
  expect(screen.getByText(/Test Shipment/i)).toBeInTheDocument();
});
