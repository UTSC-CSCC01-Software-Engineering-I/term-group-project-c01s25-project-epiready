// Mock useGlobal to prevent destructuring error
jest.mock('../../../LoggedIn', () => ({
  useGlobal: () => ({ loggedIn: true })
}));
import React from 'react';
import ActionModal from '../ActionModal';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

test('renders when open', () => {
  render(<ActionModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />);
  expect(screen.getByText(/Add Shipment Action/i)).toBeInTheDocument();
});

test('does not render when closed', () => {
  const { container } = render(<ActionModal isOpen={false} onClose={() => {}} onSubmit={() => {}} />);
  expect(container).toBeEmptyDOMElement();
});

test('shows error if submitted empty', () => {
  render(<ActionModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />);
  fireEvent.click(screen.getByText(/Add Action/i));
  expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
});
