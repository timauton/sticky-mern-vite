import { vi, describe, test, expect, beforeEach } from 'vitest';
import { getUserTagRankings } from '../../src/services/tagRankingsService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Mock fetch
globalThis.fetch = vi.fn();

describe('tagRankingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getUserTagRankings fetches user tag rankings from API', async () => {
    const mockResponse = {
      tagRankings: {
        "cats": { rank: 2, totalUsers: 50, averageRating: 4.5, totalRated: 12 },
        "dogs": { rank: 1, totalUsers: 30, averageRating: 4.8, totalRated: 8 },
        "programming": { rank: 5, totalUsers: 25, averageRating: 3.2, totalRated: 15 }
      },
      token: 'new-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await getUserTagRankings('user123', 'fake-token');

    expect(fetch).toHaveBeenCalledWith(
      `${BACKEND_URL}/users/user123/tag-rankings`,
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

    await expect(getUserTagRankings('user123', 'fake-token'))
      .rejects
      .toThrow('Failed to fetch tag rankings: 404');
  });

  test('handles network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(getUserTagRankings('user123', 'fake-token'))
      .rejects
      .toThrow('Network error');
  });
});