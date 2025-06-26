import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAllRatingStats, submitUserRating, getUserRating } from "../../src/services/ratingsService"

// Mock the environment variable
vi.mock('import.meta.env', () => ({
  VITE_BACKEND_URL: 'http://localhost:3000'
}));

describe('Rating Service', () => {
  // Set up common test data 
  const mockMemeId = 'meme123';
  const mockToken = 'valid-jwt-token';
  const mockStatsData = { averageRating: 4.2, totalRatings: 50 };
  const mockRatingData = { id: 1, rating: 5, token: 'new-token' };
  const mockUserRating = { rating: 4 };

  beforeEach(() => {
    // Clear all mocks before each test 
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      writable: true
    });

    // Mock fetch globally 
    window.fetch = vi.fn();
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  describe('getAllRatingStats', () => {
    it('should successfully fetch rating stats when user is authenticated', async () => {
      localStorage.getItem.mockReturnValue(mockToken);
      window.fetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve(mockStatsData)
      });

      const result = await getAllRatingStats(mockMemeId);

      expect(localStorage.getItem).toHaveBeenCalledWith('token');
      expect(window.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/ratings/meme/meme123/stats',
        {
          method: 'GET',
          headers: { Authorization: 'Bearer valid-jwt-token' }
        }
      );
      expect(result).toEqual(mockStatsData);
    });

    it('should throw error when user is not authenticated', async () => {
      localStorage.getItem.mockReturnValue(null);

      await expect(getAllRatingStats(mockMemeId))
        .rejects
        .toThrow('🔓 Please login to view stats 🔓');
      
      expect(window.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when API returns non-200 status', async () => {
      localStorage.getItem.mockReturnValue(mockToken);
      window.fetch.mockResolvedValue({
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      });

      await expect(getAllRatingStats(mockMemeId))
        .rejects
        .toThrow('Unable to fetch stats');
    });

    it('should handle network errors', async () => {
      localStorage.getItem.mockReturnValue(mockToken);
      window.fetch.mockRejectedValue(new Error('Network error'));

      await expect(getAllRatingStats(mockMemeId))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('submitUserRating', () => {
    const mockRating = 5;

    it('should successfully submit rating and update token', async () => {
      localStorage.getItem.mockReturnValue(mockToken);
      window.fetch.mockResolvedValue({
        status: 201,
        json: () => Promise.resolve(mockRatingData)
      });

      const result = await submitUserRating(mockMemeId, mockRating);

      expect(localStorage.getItem).toHaveBeenCalledWith('token');
      expect(window.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/ratings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-jwt-token'
          },
          body: JSON.stringify({
            meme: mockMemeId,
            rating: mockRating
          })
        }
      );
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
      expect(result).toEqual(mockRatingData);
    });

    it('should submit rating without updating token when no new token provided', async () => {
      localStorage.getItem.mockReturnValue(mockToken);
      const responseWithoutToken = { id: 1, rating: 5 }; // No token field
      window.fetch.mockResolvedValue({
        status: 201,
        json: () => Promise.resolve(responseWithoutToken)
      });

      const result = await submitUserRating(mockMemeId, mockRating);

      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual(responseWithoutToken);
    });

    it('should throw error when user is not authenticated', async () => {
      localStorage.getItem.mockReturnValue(null);

      await expect(submitUserRating(mockMemeId, mockRating))
        .rejects
        .toThrow('🔓 Please login to submit rating 🔓');
      
      expect(window.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when API returns non-201 status', async () => {
      localStorage.getItem.mockReturnValue(mockToken);
      window.fetch.mockResolvedValue({
        status: 400,
        json: () => Promise.resolve({ error: 'Bad request' })
      });

      await expect(submitUserRating(mockMemeId, mockRating))
        .rejects
        .toThrow('Unable to submit rating');
    });

    it('should handle different rating values', async () => {
      localStorage.getItem.mockReturnValue(mockToken);
      window.fetch.mockResolvedValue({
        status: 201,
        json: () => Promise.resolve(mockRatingData)
      });

      await submitUserRating(mockMemeId, 1);

      expect(window.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            meme: mockMemeId,
            rating: 1
          })
        })
      );
    });
  });

  describe('getUserRating', () => {
    it('should successfully fetch user rating when authenticated', async () => {
      localStorage.getItem.mockReturnValue(mockToken);
      window.fetch.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve(mockUserRating)
      });

      const result = await getUserRating(mockMemeId);

      expect(localStorage.getItem).toHaveBeenCalledWith('token');
      expect(window.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/ratings/meme/meme123/current',
        {
          method: 'GET',
          headers: { Authorization: 'Bearer valid-jwt-token' }
        }
      );
      expect(result).toEqual(mockUserRating);
    });

    it('should throw error when user is not authenticated', async () => {
      localStorage.getItem.mockReturnValue(null);

      await expect(getUserRating(mockMemeId))
        .rejects
        .toThrow('🔓 Please login to view rating 🔓');
      
      expect(window.fetch).not.toHaveBeenCalled();
    });

    it('should throw error when API returns non-200 status', async () => {
      localStorage.getItem.mockReturnValue(mockToken);
      window.fetch.mockResolvedValue({
        status: 404,
        json: () => Promise.resolve({ error: 'Rating not found' })
      });

      await expect(getUserRating(mockMemeId))
        .rejects
        .toThrow('Unable to fetch user rating');
    });
  });

  // Integration-style tests to check how functions work together
  describe('Integration scenarios', () => {
    it('should handle token refresh across multiple calls', async () => {
      // Simulate a scenario where submitUserRating updates the token
      localStorage.getItem.mockReturnValue(mockToken);
      
      // First call to submit rating returns new token
      window.fetch.mockResolvedValueOnce({
        status: 201,
        json: () => Promise.resolve({ ...mockRatingData, token: 'refreshed-token' })
      });

      // Submit rating (which should update token)
      await submitUserRating(mockMemeId, 5);

      // Token should be updated in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'refreshed-token');
    });
  });
});