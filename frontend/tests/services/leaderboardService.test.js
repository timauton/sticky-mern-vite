import { vi, describe, test, expect, beforeEach } from 'vitest';
import { getTagLeaderboard, getOverallLeaderboard } from '../../src/services/leaderboardService';
import "@testing-library/jest-dom"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Mock fetch
globalThis.fetch = vi.fn();

describe('leaderboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTagLeaderboard', () => {
    test('fetches tag leaderboard from API', async () => {
      const mockResponse = {
        leaderboard: [
          { username: 'alice', avgRating: 4.8, totalRated: 25, rank: 1 },
          { username: 'bob', avgRating: 4.5, totalRated: 18, rank: 2 },
          { username: 'charlie', avgRating: 4.2, totalRated: 30, rank: 3 }
        ],
        tag: 'cats',
        userRank: 2,
        token: 'new-token'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getTagLeaderboard('user123', 'cats', 'fake-token');

      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/user123/tag-rankings/cats`,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json'
          }
        }
      );

      expect(result).toEqual(mockResponse);
    });

    test('handles API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(getTagLeaderboard('user123', 'cats', 'fake-token'))
        .rejects
        .toThrow('Failed to fetch tag leaderboard: 404');
    });
  });

  describe('getOverallLeaderboard', () => {
    test('fetches overall leaderboard from API', async () => {
      const mockResponse = {
        leaderboard: [
          { username: 'alice', avgRating: 4.8, totalMemesCreated: 45, totalRatingsReceived: 230, rank: 1 },
          { username: 'bob', avgRating: 4.5, totalMemesCreated: 32, totalRatingsReceived: 180, rank: 2 },
          { username: 'charlie', avgRating: 4.2, totalMemesCreated: 28, totalRatingsReceived: 150, rank: 3 }
        ],
        userRank: 5,
        token: 'new-token'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getOverallLeaderboard('user123', 'fake-token');

      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/users/user123/overall-leaderboard`,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json'
          }
        }
      );

      expect(result).toEqual(mockResponse);
    });

    test('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getOverallLeaderboard('user123', 'fake-token'))
        .rejects
        .toThrow('Network error');
    });
  });
});