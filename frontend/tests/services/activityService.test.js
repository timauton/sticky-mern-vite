// tests/services/activityService.test.jsx
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { getUserActivity } from '../../src/services/activityService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Mock fetch
globalThis.fetch = vi.fn();

describe('activityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getUserActivity fetches user activity from API', async () => {
    const mockResponse = {
      chartData: [
        { memesCreated: 3, memesRated: 0, period: "2025-01" },
        { memesCreated: 3, memesRated: 3, period: "2025-06" }
      ],
      token: 'new-token'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await getUserActivity('user123', 'fake-token');

    expect(fetch).toHaveBeenCalledWith(
      `${BACKEND_URL}/users/user123/activity`,
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

    await expect(getUserActivity('user123', 'fake-token'))
      .rejects
      .toThrow('Failed to fetch user activity: 404');
  });

  test('handles network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(getUserActivity('user123', 'fake-token'))
      .rejects
      .toThrow('Network error');
  });
});