import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import "@testing-library/jest-dom"
import ActivityChart from '../../src/components/ActivityChart';
import { getUserActivity } from '../../src/services/activityService';
import * as auth from '../../src/utils/auth';

// Mock the services
vi.mock('../../src/services/activityService');
vi.mock('../../src/utils/auth');

// Mock ResizeObserver for JSDOM
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

const mockActivityData = {
  chartData: [
    { memesCreated: 3, memesRated: 0, period: "2025-01" },
    { memesCreated: 3, memesRated: 3, period: "2025-06" }
  ],
  token: 'new-token'
};

describe('ActivityChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    vi.mocked(auth.getCurrentUserId).mockReturnValue('user123');
  });

  it('renders the component title', async () => {
    vi.mocked(getUserActivity).mockResolvedValue(mockActivityData);

    render(<ActivityChart />);
    
    await waitFor(() => {
    expect(screen.getByText('My Activity')).toBeInTheDocument();
    })
  });

  it('shows loading state initially', async () => {
    vi.mocked(getUserActivity).mockImplementation(() => new Promise(() => {}));

    render(<ActivityChart />);
    
    expect(screen.getByText('Loading your activity...')).toBeInTheDocument();
  });

  it('renders chart container with data', async () => {
    vi.mocked(getUserActivity).mockResolvedValue(mockActivityData);

    render(<ActivityChart />);

    await waitFor(() => {
      // Check that the chart container exists (rather than testing Recharts internals)
      expect(screen.getByText('My Activity')).toBeInTheDocument();
      const chartContainer = document.querySelector('.chart-container');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  it('handles empty data gracefully', async () => {
    vi.mocked(getUserActivity).mockResolvedValue({
      chartData: [],
      token: 'token'
    });

    render(<ActivityChart />);

    await waitFor(() => {
      expect(screen.getByText('No activity data yet. Start creating and rating memes!')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(getUserActivity).mockRejectedValue(new Error('API Error'));

    render(<ActivityChart />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load activity data')).toBeInTheDocument();
    });
  });
});