// frontend/src/components/MyMemesSection.jsx
import { useState, useEffect } from 'react';
import { getUserMemes } from '../services/memeService';
import { getCurrentUserId } from '../utils/auth';
import ShareButton from './ShareButtonComponent';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyMemesSection = () => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [showAll, setShowAll] = useState(false); // New state for controlling display
  const [totalMemes, setTotalMemes] = useState(0); // Track total available memes

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = getCurrentUserId();
        
        // Fetch more memes than we initially show so we can have "show more"
        const limit = showAll ? 50 : 10; // Get 10 for data, but only show 3 initially
        const data = await getUserMemes(userId, token, sortBy, limit);
        setMemes(data.memes || []);
        setTotalMemes(data.pagination?.totalMemes || data.memes?.length || 0);
        
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      } catch (error) {
        console.error('Error fetching memes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, [sortBy, showAll]);

  // Determine how many memes to display
  const displayedMemes = showAll ? memes : memes.slice(0, 3);
  const hasMore = memes.length > 3;

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
  };

  return (
    <div className="card my-memes-card">
      <div className="my-memes">
        <h2>My Memes</h2>
        
        {/* Sort Controls */}
        <div className="sort-controls">
          <button 
            onClick={() => setSortBy('recent')}
            className={sortBy === 'recent' ? 'active' : ''}
          >
            Most Recent
          </button>
          <button 
            onClick={() => setSortBy('rating')}
            className={sortBy === 'rating' ? 'active' : ''}
          >
            Highest Rated
          </button>
        </div>

        {loading && <p>Loading your memes...</p>}
        
        {!loading && displayedMemes.length === 0 && (
          <p>No memes found. Start creating some!</p>
        )}
        
        {!loading && displayedMemes.map((meme) => (
          <div key={meme._id} className="my-meme">
            <img src={`${BACKEND_URL}/${meme.img}`} alt={meme.title} />
            <div className="my-meme-content">
              <h3>{meme.title}</h3>
              <p>Rating: {meme.averageRating}/5 ⭐</p>
            </div>
            <div className="my-meme-share">
              <ShareButton meme={meme} />
            </div>
          </div>
        ))}

        {/* Show More/Less Controls */}
        {!loading && hasMore && (
          <div className="show-more-controls">
            {!showAll ? (
              <button 
                className="show-more-button" 
                onClick={handleShowMore}
              >
                Show More ({memes.length - 3} more memes)
              </button>
            ) : (
              <button 
                className="show-less-button" 
                onClick={handleShowLess}
              >
                Show Less
              </button>
            )}
          </div>
        )}

        {/* Optional: Show total count */}
        {!loading && totalMemes > 0 && (
          <div className="memes-count">
            <p>Total: {totalMemes} memes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMemesSection;