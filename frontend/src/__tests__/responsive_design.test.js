import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ResponsiveDesign from '../components/ResponsiveDesign';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ResponsiveDesign Component', () => {
  test('renders correctly', () => {
    render(<ResponsiveDesign />);
    expect(screen.getByTestId('responsive_design-container')).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    const mockResponse = { status: 'success', message: 'interaction handled' };
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse),
      ok: true,
    });

    render(<ResponsiveDesign />);
    const button = screen.getByRole('button', { name: /simulate interaction/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('https://api.ainative.studio/some-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'interact' }),
      });
    });
  });

  test('shows loading state', async () => {
    const mockFetch = global.fetch;
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 200)));

    render(<ResponsiveDesign />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  test('handles API errors', async () => {
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ status: 'error', message: 'API error occurred' }),
      ok: false,
    });

    render(<ResponsiveDesign />);
    const button = screen.getByRole('button', { name: /simulate interaction/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/api error occurred/i)).toBeInTheDocument();
    });
  });

  test('is accessible', async () => {
    render(<ResponsiveDesign />);
    expect(await screen.findByRole('heading', { name: /kanban board/i })).toHaveAttribute(
      'aria-level',
      '1'
    );
    expect(screen.getByRole('button', { name: /simulate interaction/i })).toBeEnabled();
  });
});