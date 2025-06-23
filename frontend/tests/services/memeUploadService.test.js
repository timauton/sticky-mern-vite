import { describe, test, expect, vi, beforeEach } from 'vitest'
import { createMeme } from '../../src/services/memeUploadService'

// Mock fetch
globalThis.fetch = vi.fn()

describe('memeUploadService', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('createMeme', () => {
    test('makes correct API call with title and image', async () => {
      // Mock successful response
      fetch.mockResolvedValueOnce({
        status: 201,
        json: async () => ({ id: 123, title: 'Test Meme' })
      })

      const token = 'fake-token'
      const title = 'My Meme Title'
      const image = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const result = await createMeme(token, title, image)

      // Check fetch was called correctly
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        `${import.meta.env.VITE_BACKEND_URL}/memes`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer fake-token'
          },
          body: expect.any(FormData)
        }
      )

      // Check FormData contains correct fields
      const [[, requestOptions]] = fetch.mock.calls
      const formData = requestOptions.body
      expect(formData.get('image')).toBe(image)
      expect(formData.get('title')).toBe(title)

      // Check return value
      expect(result).toEqual({ id: 123, title: 'Test Meme' })
    })

    test('makes API call without title when title is undefined', async () => {
      fetch.mockResolvedValueOnce({
        status: 201,
        json: async () => ({ id: 124 })
      })

      const token = 'fake-token'
      const image = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await createMeme(token, undefined, image)

      const [[, requestOptions]] = fetch.mock.calls
      const formData = requestOptions.body
      expect(formData.get('image')).toBe(image)
      expect(formData.get('title')).toBeNull() // Title not included
    })

    test('makes API call without title when title is empty string', async () => {
      fetch.mockResolvedValueOnce({
        status: 201,
        json: async () => ({ id: 125 })
      })

      const token = 'fake-token'
      const image = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await createMeme(token, '', image)

      const [[, requestOptions]] = fetch.mock.calls
      const formData = requestOptions.body
      expect(formData.get('image')).toBe(image)
      expect(formData.get('title')).toBeNull() // Empty string is falsy, so not included
    })

    test('throws error when response status is not 201', async () => {
      fetch.mockResolvedValueOnce({
        status: 400,
        json: async () => ({ error: 'Bad request' })
      })

      const token = 'fake-token'
      const image = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await expect(createMeme(token, 'title', image)).rejects.toThrow('Unable to fetch memes')
    })

    test('throws error when response status is 401 (unauthorized)', async () => {
      fetch.mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      })

      const token = 'expired-token'
      const image = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await expect(createMeme(token, 'title', image)).rejects.toThrow('Unable to fetch memes')
    })

    test('throws error when network request fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      const token = 'fake-token'
      const image = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await expect(createMeme(token, 'title', image)).rejects.toThrow('Network error')
    })

    test('handles missing token', async () => {
      fetch.mockResolvedValueOnce({
        status: 201,
        json: async () => ({ id: 126 })
      })

      const image = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await createMeme(null, 'title', image)

      const [[, requestOptions]] = fetch.mock.calls
      expect(requestOptions.headers.Authorization).toBe('Bearer null')
    })

    // Will need to change this when we start requiring images!
    test('handles missing image', async () => {
      fetch.mockResolvedValueOnce({
        status: 201,
        json: async () => ({ id: 127 })
      })

      await createMeme('fake-token', 'title', null)

      const [[, requestOptions]] = fetch.mock.calls
      const formData = requestOptions.body
      expect(formData.get('image')).toBe("null")
      expect(formData.get('title')).toBe('title')
    })
  })
})