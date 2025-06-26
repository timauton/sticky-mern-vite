// tests/components/TagRankingsCards.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import "@testing-library/jest-dom"
import TagRankingsCards from '../../src/components/TagRankingsCards';
import { getUserTagRankings } from '../../src/services/tagRankingsService';
import * as auth from '../../src/utils/auth';

// Mock the services
vi.mock('../../src/services/tagRankingsService');
vi.mock('../../src/utils/auth');

const mockTagRankings = {
  tagRankings: [
    {tag: 'cats', userRank: 2, totalUsers: 50, userAvgRating: 4.5, userMemeCount: 12},
    {tag: 'dogs', userRank: 1, totalUsers: 30, userAvgRating: 4.8, userMemeCount: 8},
    {tag: 'programming', userRank: 5, totalUsers: 25, userAvgRating: 3.2, userMemeCount: 15}
  ],
  token: 'new-token'
};

describe('TagRankingsCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    vi.mocked(auth.getCurrentUserId).mockReturnValue('user123');
  });

  it('renders the component title', async () => {
    vi.mocked(getUserTagRankings).mockResolvedValue(mockTagRankings);

    render(<TagRankingsCards />);
    
    expect(screen.getByText('Tag Rankings')).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    vi.mocked(getUserTagRankings).mockImplementation(() => new Promise(() => {}));

    render(<TagRankingsCards />);
    
    expect(screen.getByText('Loading your rankings...')).toBeInTheDocument();
  });

  it('displays tag ranking cards with correct information', async () => {
    vi.mocked(getUserTagRankings).mockResolvedValue(mockTagRankings);

    render(<TagRankingsCards />);

    await waitFor(() => {
      // Check for cats ranking
      expect(screen.getByText('cats')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('out of 50 users')).toBeInTheDocument();
    });

    // Check for dogs ranking (should be #1)
    expect(screen.getByText('dogs')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('out of 30 users')).toBeInTheDocument();
  });

  it('shows different styling for #1 rankings', async () => {
    vi.mocked(getUserTagRankings).mockResolvedValue(mockTagRankings);

    render(<TagRankingsCards />);

    await waitFor(() => {
      const dogsCard = screen.getByText('dogs').closest('.tag-ranking-card');
      expect(dogsCard).toHaveClass('rank-first');
    });
  });

  it('shows appropriate styling for top 3 rankings', async () => {
    vi.mocked(getUserTagRankings).mockResolvedValue(mockTagRankings);

    render(<TagRankingsCards />);

    await waitFor(() => {
      const catsCard = screen.getByText('cats').closest('.tag-ranking-card');
      expect(catsCard).toHaveClass('rank-top-three');
    });
  });

  it('displays average rating and total rated count', async () => {
    vi.mocked(getUserTagRankings).mockResolvedValue(mockTagRankings);

    render(<TagRankingsCards />);

    await waitFor(() => {
      expect(screen.getByText('4.5⭐ avg')).toBeInTheDocument();
      expect(screen.getByText('12 rated')).toBeInTheDocument();
    });
  });

  it('handles empty rankings gracefully', async () => {
    vi.mocked(getUserTagRankings).mockResolvedValue({
      tagRankings: [],
      token: 'token'
    });

    render(<TagRankingsCards />);

    await waitFor(() => {
      expect(screen.getByText('No rankings yet. Start rating some memes!')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(getUserTagRankings).mockRejectedValue(new Error('API Error'));

    render(<TagRankingsCards />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load rankings')).toBeInTheDocument();
    });
  });
});