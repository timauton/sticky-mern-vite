import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserMemes, getUserRatedMemes } from '../../src/services/memeService';
import { getCurrentUserId } from '../utils/auth';
import ShareButton from './ShareButtonComponent';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyMemesSection = () => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [showAll, setShowAll] = useState(false);
  const [totalMemes, setTotalMemes] = useState(0);
  const [viewMode, setViewMode] = useState('created'); // 'created' or 'rated'

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = getCurrentUserId();
        
        const limit = showAll ? 50 : 10;
        let data;

        if (viewMode === 'created') {
          // Fetch user's created memes
          data = await getUserMemes(userId, token, sortBy, limit);
        } else {
          // Fetch user's rated memes
          data = await getUserRatedMemes(userId, token, sortBy, limit);
        }

        setMemes(data.memes || []);
        setTotalMemes(data.pagination?.totalMemes || data.memes?.length || 0);
        
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      } catch (error) {
        console.error(`Error fetching ${viewMode} memes:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, [sortBy, showAll, viewMode]);

  // Determine how many memes to display
  const displayedMemes = showAll ? memes : memes.slice(0, 3);
  const hasMoreThanThree = memes.length > 3;

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
  };

  // Handle sort button clicks
  const handleSortChange = (newSortBy, newViewMode) => {
    setSortBy(newSortBy);
    setViewMode(newViewMode);
    setShowAll(false); // Reset pagination when switching
  };

  // Get the appropriate title based on view mode
  const getSectionTitle = () => {
    return viewMode === 'created' ? 'My Memes' : 'My Rated Memes';
  };

  // Get appropriate empty state message
  const getEmptyMessage = () => {
    return viewMode === 'created' 
      ? 'No memes found. Start creating some!'
      : 'No rated memes found. Start rating some memes!';
  };

  return (
    <div className="card my-memes-card">
      <div className="my-memes">
        <h2>{getSectionTitle()}</h2>
        
        {/* Enhanced Sort Controls */}
        <div className="sort-controls">
          <button 
            onClick={() => handleSortChange('recent', 'created')}
            className={sortBy === 'recent' && viewMode === 'created' ? 'active' : ''}
          >
            Most Recent
          </button>
          <button 
            onClick={() => handleSortChange('rating', 'created')}
            className={sortBy === 'rating' && viewMode === 'created' ? 'active' : ''}
          >
            Highest Rated
          </button>
          <button 
            onClick={() => handleSortChange('recent', 'rated')}
            className={sortBy === 'recent' && viewMode === 'rated' ? 'active' : ''}
          >
            Recently Rated
          </button>
          <button 
            onClick={() => handleSortChange('highest', 'rated')}
            className={sortBy === 'highest' && viewMode === 'rated' ? 'active' : ''}
          >
            Highest Rated by Me
          </button>
        </div>

        {loading && <p>Loading your {viewMode === 'created' ? 'created' : 'rated'} memes...</p>}
        
        {!loading && displayedMemes.length === 0 && (
          <p>{getEmptyMessage()}</p>
        )}
        
        {!loading && displayedMemes.map((meme) => (
          <Link 
            key={meme._id} 
            to={`/meme/${viewMode === 'created' ? meme._id : meme.meme}`}
            className="my-meme"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <img src={`${BACKEND_URL}/${meme.img}`} alt={meme.title} />
            <div className="my-meme-content">
              <h3>{meme.title}</h3>
              {viewMode === 'created' ? (
                <p>Av. Rating: {meme.averageRating}/5 ⭐</p>
              ) : (
                <>
                  <p>My Rating: {meme.userRating}/5 ⭐</p>
                </>
              )}
            </div>
            <div className="my-meme-share" onClick={(e) => { e.preventDefault()}}>
              <ShareButton meme={meme} />
            </div>
          </Link>
        ))}

        {/* Show More/Less Controls */}
        {!loading && hasMoreThanThree && (
          <div className="show-more-controls">
            {!showAll ? (
              <button 
                className="show-more-button" 
                onClick={handleShowMore}
              >
                Show More ({memes.length - 3} more {viewMode === 'created' ? 'memes' : 'rated memes'})
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

        {/* Total count */}
        {!loading && totalMemes > 0 && (
          <div className="memes-count">
            <p>Total {viewMode === 'created' ? 'created' : 'rated'}: {totalMemes} memes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMemesSection;