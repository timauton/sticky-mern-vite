import { useState, useEffect } from 'react';
import { getAllRatingStats, getUserRating, submitUserRating } from '../services/ratingsService';

export const RatingBar = ({ meme_id: meme, initialRating = 0, totalRatings = 0, initialAverage = 0 }) => {
  const [userRating, setUserRating] = useState(initialRating);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [hasVoted, setHasVoted] = useState(initialRating > 0);
  const [averageRating, setAverageRating] = useState(initialAverage);
  const [ratingCount, setRatingCount] = useState(totalRatings);

  useEffect(() => {
    const loadRatingData = async () => {
      if (!meme) return;
      
      try {
        // Reset state when meme changes
        setUserRating(0);
        setHasVoted(false);
        setHoveredStar(0);
        setAverageRating(0);
        
        // Fetch stats first (this should always work)
        const statsData = await getAllRatingStats(meme);
        setAverageRating(statsData.averageRating);
        setRatingCount(statsData.totalRatings);
        
        // Try to fetch user rating (might not exist)
        try {
          const userRatingData = await getUserRating(meme);
          if (userRatingData.rating && userRatingData.rating > 0) {
            setUserRating(userRatingData.rating);
            setHasVoted(true);
          } else {
            setUserRating(0);
            setHasVoted(false)
          }
        } catch (userRatingError) {
          // User hasn't rated yet - this is expected, not an error
          if (userRatingError.message !== 'No meme found') {
            console.log('User has not rated this meme yet');
          }
        }
        
      } catch (error) {
        console.error('Failed to load rating data:', error);
        // Keep the initial values if there's an error
      } 
    };

    loadRatingData();
  }, [meme]);

  
  const handleStarClick = async (rating) => {
    if (!hasVoted) {
      try {
        await submitUserRating(meme, rating) 
        setUserRating(rating);
        setHasVoted(true);

        const statsData = await getAllRatingStats(meme)
        if (statsData) {
          setAverageRating(statsData.averageRating);
          setRatingCount(statsData.totalRatings);
        }
      } catch (error) {
        console.error('Failed to submit rating: ', error);
      }
    }
  };

  // Hover functions
  const handleStarHover = (rating) => {
    if (!hasVoted) {
      setHoveredStar(rating);
    }
  };
  const handleMouseLeave = () => {
    if (!hasVoted) {
      setHoveredStar(0);
    }
  };

  // Styling functions
  const getStarFill = (starIndex) => {
    if (hasVoted) {
      return starIndex <= userRating ? '#ff0f5c' : 'none';
    }
    return starIndex <= hoveredStar ? '#ff0f5c' : 'none';
  };
  const getStarColor = (starIndex) => {
    if (hasVoted) {
      return starIndex <= userRating ? 'text-yellow-400' : 'text-gray-300';
    }
    return starIndex <= hoveredStar ? 'text-yellow-400' : 'text-gray-300';
  };

  return (
    <div className="rating-bar-container">
      {/* Average Rating Display */}
      <div className="info-box">
        {/* User Status */}
        {hasVoted && (
          <div className="has-voted">Average<br />Rating</div>
        )}
        
        <div className="average-rating">
          {hasVoted ? averageRating.toFixed(1) : '0.0'}
        </div>
      </div>

      {/* Star Rating */}
      <div 
        className="star-box"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={hasVoted}
            className={`
              transition-all duration-200 transform hover:scale-110
              ${hasVoted ? 'cursor-default' : 'cursor-pointer hover:drop-shadow-md'}
            `}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill={getStarFill(star)}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${getStarColor(star)} transition-colors duration-200`}
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingBar;