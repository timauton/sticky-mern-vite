import { vi, describe, test, expect, beforeEach } from 'vitest';
import { getUserMemes, getUserRatedMemes } from '../../src/services/memeService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Mock fetch
globalThis.fetch = vi.fn();

describe('memeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });


  test('getUserMemes fetches user memes from API', async () => {
    const mockResponse = {
      memes: [
        { _id: '1', title: 'Test Meme', averageRating: 4.5 }
      ],
      token: 'new-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await getUserMemes('user123', 'fake-token', 'recent');

    expect(fetch).toHaveBeenCalledWith(
      `${BACKEND_URL}/memes/user/user123/ranked?order=recent&limit=5`,
      {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      }
    );

    expect(result).toEqual(mockResponse);
  });


  describe('getUserRatedMemes', () => {
    test('fetches user rated memes with default parameters', async () => {
      const mockResponse = {
        memes: [
          {
            _id: '1',
            title: 'Rated Meme',
            img: 'uploads/test.jpg',
            averageRating: 4.5,
            userRating: 5,
            ratedAt: '2024-01-15T10:00:00Z'
          }
        ],
        pagination: { totalMemes: 1 }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getUserRatedMemes('user123', 'fake-token');

      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/ratings/user/user123/ranked?order=recent&limit=10`,
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

    test('fetches user rated memes with custom sort and limit', async () => {
      const mockResponse = { 
        memes: [],
        pagination: { totalMemes: 0 } 
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await getUserRatedMemes('user123', 'fake-token', 'userRating', 20);

      expect(fetch).toHaveBeenCalledWith(
        `${BACKEND_URL}/ratings/user/user123/ranked?order=recent&limit=20`,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer fake-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    test('throws error when API returns 404', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(getUserRatedMemes('user123', 'fake-token'))
        .rejects
        .toThrow('Failed to fetch rated memes: 404');
    });

    test('throws error when API returns 401', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(getUserRatedMemes('user123', 'fake-token'))
        .rejects
        .toThrow('Failed to fetch rated memes: 401');
    });

    test('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getUserRatedMemes('user123', 'fake-token'))
        .rejects
        .toThrow('Network error');
    });

    test('returns correct data structure', async () => {
      const mockResponse = {
        memes: [
          {
            _id: '1',
            title: 'Rated Meme',
            userRating: 4,
            averageRating: 3.5
          }
        ],
        pagination: { totalMemes: 1 }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getUserRatedMemes('user123', 'fake-token');

      expect(result).toHaveProperty('memes');
      expect(result).toHaveProperty('pagination');
      expect(result.memes).toBeInstanceOf(Array);
      expect(result.memes[0]).toHaveProperty('userRating');
    });
  });
});