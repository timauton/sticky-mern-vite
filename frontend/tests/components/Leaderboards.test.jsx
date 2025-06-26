import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import "@testing-library/jest-dom"
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Leaderboards from '../../src/components/Leaderboards';
import { getTagLeaderboard, getOverallLeaderboard } from '../../src/services/leaderboardService';
import * as auth from '../../src/utils/auth';

// Mock the services
vi.mock('../../src/services/leaderboardService');
vi.mock('../../src/utils/auth');

const mockOverallLeaderboard = {
  leaderboard: [
    { username: 'alice', avgRating: 4.8, totalMemes: 45, totalRatings: 230, rank: 1 },
    { username: 'bob', avgRating: 4.5, totalMemes: 32, totalRatings: 180, rank: 2 },
    { username: 'charlie', avgRating: 4.2, totalMemes: 28, totalRatings: 150, rank: 3 }
  ],
  userStats: { rank: 5 },
  token: 'new-token'
};

const mockTagLeaderboard = {
  leaderboard: [
    { username: 'catLover', avgRating: 4.9, totalRated: 50, rank: 1 },
    { username: 'meowMaster', avgRating: 4.7, totalRated: 35, rank: 2 },
    { username: 'kittyKing', avgRating: 4.3, totalRated: 28, rank: 3 }
  ],
  tag: 'cats',
  userRank: 2,
  token: 'new-token'
};

describe('Leaderboards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    vi.mocked(auth.getCurrentUserId).mockReturnValue('user123');
  });

  it('renders the component title', async () => {
    vi.mocked(getOverallLeaderboard).mockResolvedValue(mockOverallLeaderboard);

    render(<Leaderboards />);
    
    await waitFor(() => { 
    expect(screen.getByText('Leaderboards')).toBeInTheDocument();
    })
  });

  it('shows loading state initially', async () => {
    vi.mocked(getOverallLeaderboard).mockImplementation(() => new Promise(() => {}));

    render(<Leaderboards />);
    
    expect(screen.getByText('Loading leaderboards...')).toBeInTheDocument();
  });

  it('displays overall leaderboard by default', async () => {
    vi.mocked(getOverallLeaderboard).mockResolvedValue(mockOverallLeaderboard);

    render(<Leaderboards />);

    await waitFor(() => {
      // Check for the button being active instead of just the text
      expect(screen.getByRole('button', { name: 'Overall Leaderboard' })).toHaveClass('active');
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
      expect(screen.getByText('charlie')).toBeInTheDocument();
    });
  });

  it('shows user rank information', async () => {
    vi.mocked(getOverallLeaderboard).mockResolvedValue(mockOverallLeaderboard);

    render(<Leaderboards />);

    await waitFor(() => {
      expect(screen.getByText('Your Rank: #5')).toBeInTheDocument();
    });
  });

  it('allows switching to tag leaderboard', async () => {
    const user = userEvent.setup();
    
    vi.mocked(getOverallLeaderboard).mockResolvedValue(mockOverallLeaderboard);
    vi.mocked(getTagLeaderboard).mockResolvedValue(mockTagLeaderboard);

    render(<Leaderboards />);

    // Wait for initial load - check for user data instead of duplicate text
    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });

    // Type in tag input
    const tagInput = screen.getByPlaceholderText('Enter tag (e.g. cats)');
    await user.type(tagInput, 'cats');

    // Click view button
    const viewButton = screen.getByText('View Tag Leaderboard');
    await user.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText('cats Leaderboard')).toBeInTheDocument();
      expect(screen.getByText('catLover')).toBeInTheDocument();
    });
  });

  it('handles empty leaderboard gracefully', async () => {
    vi.mocked(getOverallLeaderboard).mockResolvedValue({
      leaderboard: [],
      userRank: null,
      token: 'token'
    });

    render(<Leaderboards />);

    await waitFor(() => {
      expect(screen.getByText('No leaderboard data available yet!')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(getOverallLeaderboard).mockRejectedValue(new Error('API Error'));

    render(<Leaderboards />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load leaderboards')).toBeInTheDocument();
    });
  });
});