import { describe, it, expect } from 'vitest';
import { generateShareableUrl } from '../../src/utils/shareUtils'

describe('shareUtils', () => {
  describe('generate a shareable url', () => {
    it('should generate a shareable URL for a meme', () => {
      const meme = {
        _id:  '507f1f77bcf86cd799439011',
        title: 'Funny Cat Meme',
        image: 'uploads/cat.jpg'
      }

      const shareableUrl = generateShareableUrl(meme);
      expect(shareableUrl).toContain('/meme/507f1f77bcf86cd799439011');
      expect(shareableUrl).toContain(meme._id)
    });

    it('should generate a valid URL format', () => {
      const meme = { _id: '507f1f77bcf86cd799439011'}

      const shareableUrl = generateShareableUrl(meme);

      expect(shareableUrl).toMatch(/^https?:\/\/.+\/meme\/[a-f0-9]{24}$/);
    });

    it('should work with different meme IDs', () => {
      const meme1 = { _id: '507f1f77bcf86cd799439011' }
      const meme2 = { _id: '507f1f77bcf86cd799439012' }

      const url1 = generateShareableUrl(meme1);
      const url2 = generateShareableUrl(meme2);

      expect(url1).toContain(meme1._id);
      expect(url2).toContain(meme2._id);
      expect(url1).not.toEqual(url2);
    })
  });
})