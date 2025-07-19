import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionLog from '../ActionLog';

describe('ActionLog', () => {
  it('renders Notice by default', () => {
    render(<ActionLog type="low" msg="Test message" id={1} onDestroy={() => {}} />);
    expect(screen.getByText('Notice')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders Critical for very high type', () => {
    render(<ActionLog type="very high" msg="Critical alert" id={2} onDestroy={() => {}} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Critical alert')).toBeInTheDocument();
  });

  it('renders Warning for medium type', () => {
    render(<ActionLog type="medium" msg="Medium alert" id={3} onDestroy={() => {}} />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Medium alert')).toBeInTheDocument();
  });

  it('renders Severe for high type', () => {
    render(<ActionLog type="high" msg="High alert" id={4} onDestroy={() => {}} />);
    expect(screen.getByText('Severe')).toBeInTheDocument();
    expect(screen.getByText('High alert')).toBeInTheDocument();
  });

  it('renders Home color when isHome is true', () => {
    render(<ActionLog type="low" msg="Home alert" id={5} onDestroy={() => {}} isHome={true} />);
    expect(screen.getByText('Notice')).toBeInTheDocument();
    expect(screen.getByText('Home alert')).toBeInTheDocument();
  });


  it('flips card and calls onDestroy when Yes is clicked', () => {
    const onDestroy = jest.fn();
    render(<ActionLog type="low" msg="Delete me" id={6} onDestroy={onDestroy} />);
    // Click delete button (flip)
    fireEvent.click(screen.getByLabelText('Delete'));
    // Click Yes on back
    fireEvent.click(screen.getByText('Yes'));
    expect(onDestroy).toHaveBeenCalledWith(6);
  });

  it('flips card and cancels when No is clicked', () => {
    render(<ActionLog type="low" msg="Cancel delete" id={7} onDestroy={() => {}} />);
    // Click delete button (flip)
    fireEvent.click(screen.getByLabelText('Delete'));
    // Click No on back
    fireEvent.click(screen.getByText('No'));
    // Should still show the card front after cancel
    expect(screen.getByText('Notice')).toBeInTheDocument();
    expect(screen.getByText('Cancel delete')).toBeInTheDocument();
  });
});
