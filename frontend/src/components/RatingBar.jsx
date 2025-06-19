import { useState } from 'react';

<<<<<<< HEAD
export const RatingBar = ({ initialRating = 0, totalRatings = 0, initialAverage = 0 }) => {
  const [userRating, setUserRating] = useState(initialRating);
=======
import './StarRatingTest.css';

export default function RatingsBar() {
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
>>>>>>> eaf1665 (switch branch)
  const [hoveredStar, setHoveredStar] = useState(0);
  const [hasVoted, setHasVoted] = useState(initialRating > 0);
  const [averageRating, setAverageRating] = useState(initialAverage);
  const [ratingCount, setRatingCount] = useState(totalRatings);

  const handleStarClick = (rating) => {
    if (!hasVoted) {
      setUserRating(rating);
      setHasVoted(true);
      
      // Calculate new average (basic simulation)
      const newTotal = (averageRating * ratingCount) + rating;
      const newCount = ratingCount + 1;
      const newAverage = newTotal / newCount;
      
      setAverageRating(newAverage);
      setRatingCount(newCount);
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

  //integrated styling for reactive render
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
          {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
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