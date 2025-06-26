import { describe, it, expect } from 'vitest';
import { getComments, createComment } from '../../src/services/commentService';

describe('commentService (basic tests without mocks)', () => {
  const memeId = 'test-meme-id';

  it('getComments throws an error if no token is in localStorage', async () => {
    localStorage.removeItem('token');

    await expect(getComments(memeId)).rejects.toThrow("🔓 Please login to view comments 🔓");
  });

  it('createComment throws an error if no token is in localStorage', async () => {
    localStorage.removeItem('token');

    await expect(createComment(memeId, 'test comment')).rejects.toThrow("🔓 Please login to make a comment 🔓");
  });
});
