import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../components/CardManagement.js', () => () => (
  <div data-testid="card_management-container">
    <button data-testid="create-card-button">Create Card</button>
    <ul data-testid="cards-list">
      <li data-testid="card-item">Card 1</li>
      <li data-testid="card-item">Card 2</li>
    </ul>
  </div>
));

jest.mock('react-router-dom', () => ({
  useHistory: () => ({ push: jest.fn() }),
}));

describe('CardManagement Component', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<CardManagement />);
    expect(screen.getByTestId('card_management-container')).toBeInTheDocument();
    expect(screen.getByTestId('create-card-button')).toBeInTheDocument();
    expect(screen.getAllByTestId('card-item').length).toBe(2);
  });

  it('handles create card button click', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue({ id: 3, title: 'Card 3' }) });
    render(<CardManagement />);
    const createButton = screen.getByTestId('create-card-button');
    userEvent.click(createButton);
    await waitFor(() => {
      expect(screen.getAllByTestId('card-item').length).toBe(3);
    });
  });

  it('shows loading state while fetching cards', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 500)));
    render(<CardManagement />);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  it('handles API errors when fetching cards', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Error fetching cards' });
    render(<CardManagement />);
    await waitFor(() => {
      expect(screen.getByText(/error fetching cards/i)).toBeInTheDocument();
    });
  });

  it('is accessible', async () => {
    render(<CardManagement />);
    expect(await screen.findByRole('button', { name: /create card/i })).toBeEnabled();
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(2);
    listItems.forEach(item => expect(item).toHaveAttribute('aria-label'));
  });
});