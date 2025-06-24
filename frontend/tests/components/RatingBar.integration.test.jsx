import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RatingBar from '../../src/components/RatingBar';

// Mock the rating service
vi.mock('../../src/services/ratingsService', () => ({
  getAllRatingStats: vi.fn(),
  getUserRating: vi.fn(),
  submitUserRating: vi.fn()
}));

import { getAllRatingStats, getUserRating, submitUserRating } from '../../src/services/ratingsService';

describe('RatingBar API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'fake-token'),
        setItem: vi.fn(),
      },
      writable: true
    });
  });

  it('shows user as voted when API returns user rating', async () => {
    const memeId = 'test-meme-123';
    
    // Mock successful API responses
    getAllRatingStats.mockResolvedValue({
      averageRating: 4.2,
      totalRatings: 10
    });
    
    getUserRating.mockResolvedValue({
      rating: 3
    });

    render(<RatingBar meme_id={memeId} />);

    // Wait for both API calls and UI updates
    await waitFor(() => {
      expect(screen.getByText('4.2')).toBeInTheDocument();
      expect(screen.getByText(/Average/)).toBeInTheDocument();
    });

    // Verify user is shown as having voted
    const thirdStar = screen.getByLabelText('Rate 3 stars');
    expect(thirdStar).toBeDisabled();
    
    // Verify API calls were made
    expect(getAllRatingStats).toHaveBeenCalledWith(memeId);
    expect(getUserRating).toHaveBeenCalledWith(memeId);
  });

  it('shows user as not voted when API returns no rating', async () => {
    const memeId = 'test-meme-456';
    
    getAllRatingStats.mockResolvedValue({
      averageRating: 3.8,
      totalRatings: 5
    });
    
    // User hasn't rated - API throws error
    getUserRating.mockRejectedValue(new Error('Unable to fetch user rating'));

    render(<RatingBar meme_id={memeId} />);

    await waitFor(() => {
      expect(screen.getByText('0.0')).toBeInTheDocument(); // Shows 0.0 until user votes
    });

    // Verify user can still vote
    const firstStar = screen.getByLabelText('Rate 1 star');
    expect(firstStar).not.toBeDisabled();
    
    // Should not show "Average Rating" text
    expect(screen.queryByText(/Average/)).not.toBeInTheDocument();
  });

  it('submits rating and updates display', async () => {
    const memeId = 'test-meme-789';
    
    // Initial state: user hasn't rated
    getAllRatingStats
      .mockResolvedValueOnce({ averageRating: 4.0, totalRatings: 5 })  // Initial load
      .mockResolvedValueOnce({ averageRating: 4.2, totalRatings: 6 }); // After submit
    
    getUserRating.mockRejectedValue(new Error('No rating found'));
    submitUserRating.mockResolvedValue({ rating: 5 });

    render(<RatingBar meme_id={memeId} />);

    // Wait for initial load - should show 0.0 since user hasn't voted
    await waitFor(() => {
      expect(screen.getByText('0.0')).toBeInTheDocument();
    });

    // User clicks to rate 5 stars
    const fiveStar = screen.getByLabelText('Rate 5 stars');
    fireEvent.click(fiveStar);

    // Wait for submission and UI update - now shows real average
    await waitFor(() => {
      expect(screen.getByText('4.2')).toBeInTheDocument(); // Updated average
      expect(screen.getByText(/Average/)).toBeInTheDocument(); // Now shows as voted
    });

    // Stars should now be disabled
    expect(fiveStar).toBeDisabled();
    
    // Verify API calls
    expect(submitUserRating).toHaveBeenCalledWith(memeId, 5);
    expect(getAllRatingStats).toHaveBeenCalledTimes(2); // Initial + after submit
  });

  it('handles API errors gracefully', async () => {
    const memeId = 'error-meme';
    
    // Mock API failures
    getAllRatingStats.mockRejectedValue(new Error('Network error'));
    getUserRating.mockRejectedValue(new Error('Network error'));

    render(<RatingBar meme_id={memeId} />);

    // Should show initial/fallback values when API fails
    await waitFor(() => {
      expect(screen.getByText('0.0')).toBeInTheDocument();
    });

    // Component should still be interactive
    const firstStar = screen.getByLabelText('Rate 1 star');
    expect(firstStar).not.toBeDisabled();
  });

  it('resets state when meme changes', async () => {
    const firstMeme = 'meme-1';
    const secondMeme = 'meme-2';
    
    // Setup mocks for both memes
    getAllRatingStats.mockImplementation((memeId) => {
      if (memeId === firstMeme) return Promise.resolve({ averageRating: 4.0, totalRatings: 8 });
      if (memeId === secondMeme) return Promise.resolve({ averageRating: 3.5, totalRatings: 6 });
      return Promise.resolve({ averageRating: 0, totalRatings: 0 });
    });
    
    getUserRating.mockImplementation((memeId) => {
      if (memeId === firstMeme) return Promise.resolve({ rating: 4 });
      if (memeId === secondMeme) return Promise.reject(new Error('No rating'));
      return Promise.reject(new Error('No rating'));
    });

    // Render first meme
    const { rerender } = render(<RatingBar meme_id={firstMeme} />);

    // Wait for first meme (user has voted) - shows real average
    await waitFor(() => {
      expect(screen.getByText('4.0')).toBeInTheDocument();
      expect(screen.getByText(/Average/)).toBeInTheDocument();
    });

    // Verify stars are disabled (user has voted)
    expect(screen.getByLabelText('Rate 4 stars')).toBeDisabled();

    // Switch to second meme
    rerender(<RatingBar meme_id={secondMeme} />);

    // Wait for second meme (user hasn't voted) - shows 0.0
    await waitFor(() => {
      expect(screen.getByText('0.0')).toBeInTheDocument(); // Shows 0.0 since user hasn't voted
      expect(screen.queryByText(/Average/)).not.toBeInTheDocument();
    });

    // Stars should be enabled again
    expect(screen.getByLabelText('Rate 3 stars')).not.toBeDisabled();
    
    // Verify correct API calls were made
    expect(getAllRatingStats).toHaveBeenCalledWith(firstMeme);
    expect(getAllRatingStats).toHaveBeenCalledWith(secondMeme);
    expect(getUserRating).toHaveBeenCalledWith(firstMeme);
    expect(getUserRating).toHaveBeenCalledWith(secondMeme);
  });
});