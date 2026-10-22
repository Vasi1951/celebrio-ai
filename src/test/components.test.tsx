import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('UI Components & Interaction Suite', () => {
  it('renders application brand and main navigation landmarks', () => {
    render(<App />);
    expect(screen.getAllByText(/Celebrio/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders persona switcher tabs with weddings, birthdays, and community', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Weddings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Birthdays/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Community/i })).toBeInTheDocument();
  });

  it('switches to Birthday persona when Birthday button is clicked', () => {
    render(<App />);
    const bdayBtn = screen.getByRole('button', { name: /Birthdays/i });
    fireEvent.click(bdayBtn);
    expect(screen.getByText(/Leo's Neon Cyberpunk 30th Birthday Bash/i)).toBeInTheDocument();
  });

  it('switches to Community festival persona when Community button is clicked', () => {
    render(<App />);
    const commBtn = screen.getByRole('button', { name: /Community/i });
    fireEvent.click(commBtn);
    expect(screen.getByText(/Oakridge Autumn Harvest & Arts Festival/i)).toBeInTheDocument();
  });

  it('switches between planning section tabs (Budget, Timeline, Vendors, Ideas)', () => {
    render(<App />);
    const timelineTab = screen.getByRole('tab', { name: /Timeline/i });
    fireEvent.click(timelineTab);
    expect(screen.getByText(/Day-of Run of Show/i)).toBeInTheDocument();

    const vendorTab = screen.getByRole('tab', { name: /Vendor/i });
    fireEvent.click(vendorTab);
    expect(screen.getByText(/Vendor & Contractor Command Center/i)).toBeInTheDocument();

    const ideasTab = screen.getByRole('tab', { name: /Ideas/i });
    fireEvent.click(ideasTab);
    expect(screen.getByText(/GenAI Bespoke Idea Studio/i)).toBeInTheDocument();
  });

  it('opens and closes the AI assistant drawer', () => {
    render(<App />);
    const openBtn = screen.getByRole('button', { name: /Open Celebrio AI Planning Copilot/i });
    fireEvent.click(openBtn);

    expect(screen.getByText(/Celebrio AI Copilot/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close Assistant Drawer/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Celebrio AI Copilot/i)).not.toBeInTheDocument();
  });
});
