import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

describe('Authentication Component', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<Authentication />);
    expect(screen.getByTestId('authentication-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    render(<Authentication />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    userEvent.type(emailInput, 'test@example.com');
    userEvent.type(passwordInput, 'password123');
    userEvent.click(loginButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ainative.studio/api/v1/auth',
        expect.anything()
      );
    });
  });

  test('shows loading state when logging in', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
      })
    );

    render(<Authentication />);
    const loginButton = screen.getByRole('button', { name: /login/i });

    userEvent.click(loginButton);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
    });
  });

  test('handles API errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
        ok: false,
      })
    );

    render(<Authentication />);
    const loginButton = screen.getByRole('button', { name: /login/i });

    userEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('is accessible', async () => {
    render(<Authentication />);
    const loginForm = screen.getByTestId('authentication-container');

    expect(loginForm).toHaveAccessibleName(/login form/i);
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
    expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
  });
});