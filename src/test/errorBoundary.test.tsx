import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Component that throws on demand
const ProblemChild: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Simulated crash in child component');
  }
  return <div>Normal Content Rendered</div>;
};

describe('ErrorBoundary Component Suite', () => {
  it('renders children normally when there is no error', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content Rendered')).toBeInTheDocument();
  });

  it('catches runtime errors and displays accessible fallback UI', () => {
    // Suppress console.error during the intentional throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify alert role for screen readers
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();

    expect(screen.getByText(/Unexpected Application Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulated crash in child component/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reload Page/i })).toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders custom fallback if provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>Custom Error View</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error View')).toBeInTheDocument();
    spy.mockRestore();
  });
});
