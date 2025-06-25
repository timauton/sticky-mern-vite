import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import MyMemesSection from '../../src/components/MyMemesSection';

// Mock the service and auth utils
vi.mock('../../src/services/memeService', () => ({
  getUserMemes: vi.fn()
}));

vi.mock('../../src/utils/auth', () => ({
  getCurrentUserId: vi.fn()
}));

import { getUserMemes } from '../../src/services/memeService';
import { getCurrentUserId } from '../../src/utils/auth';

describe('MyMemesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'fake-token'),
        setItem: vi.fn()
      },
      writable: true
    });

    // Mock getCurrentUserId to return a user ID
    getCurrentUserId.mockReturnValue('mock-user-id');
  });

  test('renders My Memes heading', async () => {
    // Mock successful meme fetch
    getUserMemes.mockResolvedValueOnce({
      memes: [],
      token: 'new-token'
    });

    render(<MyMemesSection />);

    expect(screen.getByText('My Memes')).toBeInTheDocument();
  });

  test('shows loading state initially', async () => {
    // Mock slow response
    getUserMemes.mockImplementation(() => new Promise(() => {}));

    render(<MyMemesSection />);

    expect(screen.getByText('My Memes')).toBeInTheDocument();
    expect(screen.getByText('Loading your memes...')).toBeInTheDocument();
  });

  test('fetches and displays memes from API', async () => {
    const mockMemes = [
      {
        _id: '1',
        title: 'Funny Cat Meme',
        img: '/images/cat.jpg',
        averageRating: 4.5
      },
      {
        _id: '2',
        title: 'Dog Video',
        img: '/images/dog.jpg',
        averageRating: 3.8
      }
    ];

    getUserMemes.mockResolvedValueOnce({
      memes: mockMemes,
      token: 'new-token'
    });

    render(<MyMemesSection />);

    // Wait for loading to finish and memes to appear
    await waitFor(() => {
      expect(screen.getByText('Funny Cat Meme')).toBeInTheDocument();
    });

    expect(screen.getByText('Dog Video')).toBeInTheDocument();
    
    // Check for rating text - looking for the actual text structure
    expect(screen.getByText(/Rating: 4.5\/5/)).toBeInTheDocument();
    expect(screen.getByText(/Rating: 3.8\/5/)).toBeInTheDocument();
  });

  test('allows switching between recent and rating sort', async () => {
    const mockMemes = [
      { _id: '1', title: 'Meme 1', averageRating: 4.5, img: '/test1.jpg' },
      { _id: '2', title: 'Meme 2', averageRating: 3.8, img: '/test2.jpg' }
    ];

    // Mock the service to return results
    getUserMemes
      .mockResolvedValueOnce({ 
        memes: mockMemes, 
        token: 'token' 
      }) // Initial call
      .mockResolvedValueOnce({ 
        memes: [...mockMemes].reverse(), 
        token: 'token' 
      }); // After sort change

    render(<MyMemesSection />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Meme 1')).toBeInTheDocument();
    });

    // Click the "Highest Rated" button
    const ratingButton = screen.getByText('Highest Rated');
    fireEvent.click(ratingButton);

    // Should call the service again with different sort
    await waitFor(() => {
      expect(getUserMemes).toHaveBeenCalledTimes(2);
    });
    
    // Check that the service was called with the correct parameters
    expect(getUserMemes).toHaveBeenNthCalledWith(1, 'mock-user-id', 'fake-token', 'recent', 10);
    expect(getUserMemes).toHaveBeenNthCalledWith(2, 'mock-user-id', 'fake-token', 'rating', 10);
  });

  test('initially shows only 3 memes with show more button when more than 3 memes exist', async () => {
    const mockMemes = Array.from({ length: 7 }, (_, i) => ({
      _id: `${i + 1}`,
      title: `Meme ${i + 1}`,
      img: `/images/meme${i + 1}.jpg`,
      averageRating: 4.0 + (i * 0.1)
    }));

    getUserMemes.mockResolvedValueOnce({
      memes: mockMemes,
      token: 'new-token'
    });

    render(<MyMemesSection />);

    await waitFor(() => {
      expect(screen.getByText('Meme 1')).toBeInTheDocument();
    });

    // Should only show 3 memes initially
    expect(screen.getByText('Meme 1')).toBeInTheDocument();
    expect(screen.getByText('Meme 2')).toBeInTheDocument();
    expect(screen.getByText('Meme 3')).toBeInTheDocument();
    expect(screen.queryByText('Meme 4')).not.toBeInTheDocument();

    // Should show "Show More" button
    expect(screen.getByText('Show More (4 more memes)')).toBeInTheDocument();
  });

  test('shows all memes when show more is clicked', async () => {
    const mockMemes = Array.from({ length: 5 }, (_, i) => ({
      _id: `${i + 1}`,
      title: `Meme ${i + 1}`,
      img: `/images/meme${i + 1}.jpg`,
      averageRating: 4.0
    }));

    getUserMemes
      .mockResolvedValueOnce({
        memes: mockMemes, // First call returns all memes
        token: 'token'
      })
      .mockResolvedValueOnce({
        memes: mockMemes, // Second call when showAll becomes true
        token: 'token'
      });

    render(<MyMemesSection />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Meme 1')).toBeInTheDocument();
    });

    // Should only show first 3 initially
    expect(screen.queryByText('Meme 4')).not.toBeInTheDocument();

    // Click show more
    const showMoreButton = screen.getByText(/Show More/);
    fireEvent.click(showMoreButton);

    // Should now show all memes
    await waitFor(() => {
      expect(screen.getByText('Meme 4')).toBeInTheDocument();
      expect(screen.getByText('Meme 5')).toBeInTheDocument();
    });

    // Should show "Show Less" button
    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });

  test('does not show show more button when user has 3 or fewer memes', async () => {
    const mockMemes = [
      { _id: '1', title: 'Meme 1', img: '/images/meme1.jpg', averageRating: 4.0 },
      { _id: '2', title: 'Meme 2', img: '/images/meme2.jpg', averageRating: 4.0 }
    ];

    getUserMemes.mockResolvedValueOnce({
      memes: mockMemes,
      token: 'token'
    });

    render(<MyMemesSection />);

    await waitFor(() => {
      expect(screen.getByText('Meme 1')).toBeInTheDocument();
    });

    // Should not show "Show More" button
    expect(screen.queryByText(/Show More/)).not.toBeInTheDocument();
  });

  test('displays no memes message when user has no memes', async () => {
    getUserMemes.mockResolvedValueOnce({
      memes: [],
      token: 'token'
    });

    render(<MyMemesSection />);

    await waitFor(() => {
      expect(screen.getByText('No memes found. Start creating some!')).toBeInTheDocument();
    });

    // Should not show any meme cards or show more button
    expect(screen.queryByText(/Show More/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
  });

  test('shows and hides show less button correctly', async () => {
    const mockMemes = Array.from({ length: 6 }, (_, i) => ({
      _id: `${i + 1}`,
      title: `Meme ${i + 1}`,
      img: `/images/meme${i + 1}.jpg`,
      averageRating: 4.0
    }));

    getUserMemes
      .mockResolvedValue({
        memes: mockMemes,
        token: 'token'
      });

    render(<MyMemesSection />);

    await waitFor(() => {
      expect(screen.getByText('Meme 1')).toBeInTheDocument();
    });

    // Initially should show only 3 memes and "Show More" button
    expect(screen.getByText('Meme 1')).toBeInTheDocument();
    expect(screen.getByText('Meme 2')).toBeInTheDocument();
    expect(screen.getByText('Meme 3')).toBeInTheDocument();
    expect(screen.queryByText('Meme 4')).not.toBeInTheDocument();
    expect(screen.getByText('Show More (3 more memes)')).toBeInTheDocument();

    // Click show more
    fireEvent.click(screen.getByText('Show More (3 more memes)'));

    await waitFor(() => {
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });

    // Should now show all memes
    expect(screen.getByText('Meme 4')).toBeInTheDocument();
    expect(screen.getByText('Meme 5')).toBeInTheDocument();
    expect(screen.getByText('Meme 6')).toBeInTheDocument();

    // Click show less
    fireEvent.click(screen.getByText('Show Less'));

    // Should be back to showing only 3 memes and "Show More" button
    await waitFor(() => {
      expect(screen.getByText('Show More (3 more memes)')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    expect(screen.queryByText('Meme 4')).not.toBeInTheDocument();
  });
});