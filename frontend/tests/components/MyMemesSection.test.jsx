import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import "@testing-library/jest-dom"
import MyMemesSection from '../../src/components/MyMemesSection';
import * as memeService from '../../src/services/memeService';
import * as auth from '../../src/utils/auth';

// Mock the services
vi.mock('../../src/services/memeService');
vi.mock('../../src/utils/auth');

const mockMemes = [
  {
    _id: '1',
    title: 'Meme 1',
    img: 'test1.jpg',
    averageRating: 4.5,
  },
  {
    _id: '2',
    title: 'Meme 2',
    img: 'test2.jpg',
    averageRating: 3.8,
  },
  {
    _id: '3',
    title: 'Meme 3',
    img: 'test3.jpg',
    averageRating: 4.2,
  },
  {
    _id: '4',
    title: 'Meme 4',
    img: 'test4.jpg',
    averageRating: 3.5,
  },
];

const mockRatedMemes = [
  {
    _id: '1',
    title: 'Rated Meme 1',
    img: 'rated1.jpg',
    averageRating: 4.0,
    userRating: 5,
    ratedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: '2', 
    title: 'Rated Meme 2',
    img: 'rated2.jpg',
    averageRating: 3.2,
    userRating: 4,
    ratedAt: '2024-01-10T09:00:00Z'
  }
];

describe('MyMemesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    vi.mocked(auth.getCurrentUserId).mockReturnValue('user123');
  });

  it('renders My Memes heading', async () => {
    vi.mocked(memeService.getUserMemes).mockResolvedValue({
      memes: mockMemes
    });

    render(<MyMemesSection />);
    
    expect(screen.getByText('My Memes')).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    vi.mocked(memeService.getUserMemes).mockImplementation(() => new Promise(() => {}));

    render(<MyMemesSection />);
    
    expect(screen.getByText(/Loading your created memes/)).toBeInTheDocument();
  });

  it('fetches and displays memes from API', async () => {
    vi.mocked(memeService.getUserMemes).mockResolvedValue({
      memes: mockMemes
    });

    render(<MyMemesSection />);

    await waitFor(() => {
      expect(screen.getByText('Meme 1')).toBeInTheDocument();
      expect(screen.getByText('Meme 2')).toBeInTheDocument();
    });

    expect(memeService.getUserMemes).toHaveBeenCalledWith(
      'user123',
      'fake-token',
      'recent',
      10
    );
  });

  it('allows switching between recent and rating sort', async () => {
    const user = userEvent.setup();
    vi.mocked(memeService.getUserMemes).mockResolvedValue({
      memes: mockMemes
    });

    render(<MyMemesSection />);

    const highestRatedButton = screen.getByText('My Highest Rated');
    await user.click(highestRatedButton);

    await waitFor(() => {
      expect(memeService.getUserMemes).toHaveBeenCalledWith(
        'user123',
        'fake-token', 
        'rating',
        10
      );
    });
  });

  it('initially shows only 3 memes with show more button when more than 3 memes exist', async () => {
    vi.mocked(memeService.getUserMemes).mockResolvedValue({
      memes: mockMemes // 4 memes
    });

    render(<MyMemesSection />);

    await waitFor(() => {
      expect(screen.getByText('Meme 1')).toBeInTheDocument();
      expect(screen.getByText('Meme 2')).toBeInTheDocument();
      expect(screen.getByText('Meme 3')).toBeInTheDocument();
      expect(screen.queryByText('Meme 4')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Show More/)).toBeInTheDocument();
  });

  it('shows all memes when show more is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(memeService.getUserMemes).mockResolvedValue({
      memes: mockMemes
    });

    render(<MyMemesSection />);

    await waitFor(() => {
      expect(screen.getByText(/Show More/)).toBeInTheDocument();
    });

    const showMoreButton = screen.getByText(/Show More/);
    await user.click(showMoreButton);

    await waitFor(() => {
      expect(screen.getByText('Meme 4')).toBeInTheDocument();
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });
  });

  it('does not show show more button when user has 3 or fewer memes', async () => {
    vi.mocked(memeService.getUserMemes).mockResolvedValue({
      memes: mockMemes.slice(0, 3) // Exactly 3 memes
    });

    render(<MyMemesSection />);

    await waitFor(() => {
      expect(screen.getByText('Meme 1')).toBeInTheDocument();
    });

    // Should NOT show any pagination controls with exactly 3 memes
    expect(screen.queryByText(/Show More/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Show Less/)).not.toBeInTheDocument();
  });

  it('displays no memes message when user has no memes', async () => {
    vi.mocked(memeService.getUserMemes).mockResolvedValue({
      memes: []
    });

    render(<MyMemesSection />);

    await waitFor(() => {
      expect(screen.getByText('No memes found. Start creating some!')).toBeInTheDocument();
    });
  });

  it('shows and hides show less button correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(memeService.getUserMemes).mockResolvedValue({
      memes: mockMemes
    });

    render(<MyMemesSection />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Meme 1')).toBeInTheDocument();
    });

    // Click show more
    const showMoreButton = screen.getByText(/Show More/);
    await user.click(showMoreButton);

    // Should now show "Show Less" button
    await waitFor(() => {
      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });

    // Click show less
    const showLessButton = screen.getByText('Show Less');
    await user.click(showLessButton);

    // Should go back to showing "Show More"
    await waitFor(() => {
      expect(screen.getByText(/Show More/)).toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });
  });

  describe('Rated Memes Functionality', () => {
    it('shows all four sort buttons', async () => {
      vi.mocked(memeService.getUserMemes).mockResolvedValue({
        memes: mockMemes
      });

      render(<MyMemesSection />);

      expect(screen.getByText('My Most Recent')).toBeInTheDocument();
      expect(screen.getByText('My Highest Rated')).toBeInTheDocument();
      expect(screen.getByText('Recently Rated by Me')).toBeInTheDocument();
      expect(screen.getByText('Highest Rated by Me')).toBeInTheDocument();
    });

    it('calls getUserRatedMemes when "Recently Rated by Me" is clicked', async () => {
      const user = userEvent.setup();
      
      vi.mocked(memeService.getUserMemes).mockResolvedValue({ memes: [] });
      vi.mocked(memeService.getUserRatedMemes).mockResolvedValue({ 
        memes: mockRatedMemes
      });

      render(<MyMemesSection />);

      const recentlyRatedButton = screen.getByText('Recently Rated by Me');
      await user.click(recentlyRatedButton);

      await waitFor(() => {
        expect(memeService.getUserRatedMemes).toHaveBeenCalledWith(
          'user123',
          'fake-token', 
          'recent',
          10
        );
      });
    });

    it('shows user rating when viewing rated memes', async () => {
      const user = userEvent.setup();
      
      vi.mocked(memeService.getUserMemes).mockResolvedValue({ memes: [] });
      vi.mocked(memeService.getUserRatedMemes).mockResolvedValue({ 
        memes: [
          {
            _id: '1',
            title: 'My Rated Meme',
            img: 'uploads/rated.jpg',
            averageRating: 3.5,
            userRating: 5
          }
        ]
      });

      render(<MyMemesSection />);

      const recentlyRatedButton = screen.getByText('Recently Rated by Me');
      await user.click(recentlyRatedButton);

      await waitFor(() => {
        expect(screen.getByText('My Rated Meme')).toBeInTheDocument();
        expect(screen.getByText(/My Rating: 5\/5/)).toBeInTheDocument();
        expect(screen.getByText(/Average: 3.5\/5/)).toBeInTheDocument();
      });
    });

    it('changes title when switching to rated memes', async () => {
      const user = userEvent.setup();
      
      vi.mocked(memeService.getUserMemes).mockResolvedValue({ memes: [] });
      vi.mocked(memeService.getUserRatedMemes).mockResolvedValue({ memes: [] });

      render(<MyMemesSection />);

      // Initially shows "My Memes"
      expect(screen.getByText('My Memes')).toBeInTheDocument();

      // Click rated memes button
      const recentlyRatedButton = screen.getByText('Recently Rated by Me');
      await user.click(recentlyRatedButton);

      // Should change to "My Rated Memes"
      await waitFor(() => {
        expect(screen.getByText('My Rated Memes')).toBeInTheDocument();
      });
    });

    it('switches back to created memes when "My Most Recent" clicked after viewing rated', async () => {
      const user = userEvent.setup();
      
      vi.mocked(memeService.getUserMemes).mockResolvedValue({ 
        memes: [
          {
            _id: '2',
            title: 'My Created Meme',
            img: 'uploads/created.jpg',
            averageRating: 4.2
          }
        ]
      });
      vi.mocked(memeService.getUserRatedMemes).mockResolvedValue({ memes: [] });

      render(<MyMemesSection />);

      // Click rated memes first
      await user.click(screen.getByText('Recently Rated by Me'));
      
      // Wait for title change
      await waitFor(() => {
        expect(screen.getByText('My Rated Memes')).toBeInTheDocument();
      });
      
      // Then click back to created memes
      await user.click(screen.getByText('My Most Recent'));

      await waitFor(() => {
        expect(screen.getByText('My Created Meme')).toBeInTheDocument();
        expect(screen.getByText(/Rating: 4.2\/5/)).toBeInTheDocument();
        expect(screen.getByText('My Memes')).toBeInTheDocument(); // Title should change back
      });
    });

    it('calls getUserRatedMemes with userRating sort when "Highest Rated by Me" is clicked', async () => {
      const user = userEvent.setup();
      
      vi.mocked(memeService.getUserMemes).mockResolvedValue({ memes: [] });
      vi.mocked(memeService.getUserRatedMemes).mockResolvedValue({ 
        memes: mockRatedMemes
      });

      render(<MyMemesSection />);

      const highestRatedByMeButton = screen.getByText('Highest Rated by Me');
      await user.click(highestRatedByMeButton);

      await waitFor(() => {
        expect(memeService.getUserRatedMemes).toHaveBeenCalledWith(
          'user123',
          'fake-token', 
          'userRating',
          10
        );
      });
    });
  });
});