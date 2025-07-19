// Mock useGlobal to prevent destructuring error
jest.mock('../../../LoggedIn', () => ({
  useGlobal: () => ({ loggedIn: true })
}));
import React from 'react';
import ActionModal from '../ActionModal';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

test('renders when open', () => {
  render(<ActionModal open={true} onClose={() => {}} onSubmit={() => {}} />);
  expect(screen.getByText(/Add Action/i)).toBeInTheDocument();
});

test('does not render when closed', () => {
  const { container } = render(<ActionModal open={false} onClose={() => {}} onSubmit={() => {}} />);
  expect(container).toBeEmptyDOMElement();
});

test('shows error if submitted empty', () => {
  render(<ActionModal open={true} onClose={() => {}} onSubmit={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
});
