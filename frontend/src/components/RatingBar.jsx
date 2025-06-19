import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingBar = ({ initialRating = 0, totalRatings = 0, initialAverage = 0 }) => {
  const [userRating, setUserRating] = useState(initialRating);
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

  const getStarFill = (starIndex) => {
    if (hasVoted) {
      return starIndex <= userRating ? 'fill' : 'none';
    }
    return starIndex <= hoveredStar ? 'fill' : 'none';
  };

  const getStarColor = (starIndex) => {
    if (hasVoted) {
      return starIndex <= userRating ? 'text-yellow-400' : 'text-gray-300';
    }
    return starIndex <= hoveredStar ? 'text-yellow-400' : 'text-gray-300';
  };

  return (
    <div className="flex items-center gap-4 p-4">
      {/* Average Rating Display */}
      <div className="flex flex-col items-center min-w-[80px]">
        <div className="text-2xl font-bold text-gray-800">
          {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
        </div>
        <div className="text-sm text-gray-500">
          {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
        </div>
      </div>

      {/* Star Rating */}
      <div 
        className="flex gap-1"
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
            <Star
              size={24}
              fill={getStarFill(star)}
              className={`${getStarColor(star)} transition-colors duration-200`}
            />
          </button>
        ))}
      </div>

      {/* User Status */}
      {hasVoted && (
        <div className="text-sm text-green-600 font-medium">
          You rated: {userRating} star{userRating > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default RatingBar;