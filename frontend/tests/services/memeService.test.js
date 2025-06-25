import { vi, describe, test, expect, beforeEach } from 'vitest';
import { getUserMemes } from '../../src/services/memeService';

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
});