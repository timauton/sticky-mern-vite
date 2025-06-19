import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import {
  mockFetchExistingRatings,
  mockSaveRating,
  mockCheckUserRating,
  mockRemoveUserRating
} from './mockRatingService';

import './StarRatingTest.css';

export default function RatingsBar() {
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [existingRatings, setExistingRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRatings = async () => {
      setLoading(true);
      try {
        const userExistingRating = await mockCheckUserRating('test-image-123');
        if (userExistingRating) {
          setUserRating(userExistingRating);
          setHasRated(true);
        }

        const ratings = await mockFetchExistingRatings('test-image-123');
        setExistingRatings(ratings);

        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, rating) => acc + rating, 0);
          setAverageRating((sum / ratings.length).toFixed(1));
          setTotalRatings(ratings.length);
        }
      } catch (error) {
        console.error('Error loading ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRatings();
  }, []);

  const handleRating = async (rating) => {
    if (hasRated) return;

    setLoading(true);
    try {
      await mockSaveRating('test-image-123', rating);
      setUserRating(rating);
      setHasRated(true);

      const newTotal = totalRatings + 1;
      const newSum = (parseFloat(averageRating) * totalRatings) + rating;
      setAverageRating((newSum / newTotal).toFixed(1));
      setTotalRatings(newTotal);
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetRating = async () => {
    setLoading(true);
    try {
      await mockRemoveUserRating('test-image-123');
      setUserRating(0);
      setHasRated(false);
      setHoveredStar(0);

      if (existingRatings.length > 0) {
        const sum = existingRatings.reduce((acc, rating) => acc + rating, 0);
        setAverageRating((sum / existingRatings.length).toFixed(1));
        setTotalRatings(existingRatings.length);
      }
    } catch (error) {
      console.error('Error resetting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStarClass = (starIndex) => {
    const currentRating = hoveredStar || userRating;
    let classes = '';

    if (starIndex <= currentRating) {
      classes += hasRated ? 'star-rated' : 'star-hover';
      classes += ' star-filled';
    } else {
      classes += ' star-empty';
    }

    return classes;
  };

  if (loading) {
    return (
      <div className="rating-container">
        <div className="rating-section">
          <p className="rating-loading">Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-container">
      <div className="rating-section">
        <h3 className="rating-title">Rate this image (Test Mode)</h3>

        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => !hasRated && setHoveredStar(star)}
              onMouseLeave={() => !hasRated && setHoveredStar(0)}
              disabled={hasRated || loading}
              className={`star-button ${hasRated || loading ? 'star-button-disabled' : 'star-button-active'}`}
            >
              <Star size={32} className={getStarClass(star)} />
            </button>
          ))}
        </div>

        {!hasRated ? (
          <p className="rating-prompt">Click a star to rate this image</p>
        ) : (
          <div className="rating-results">
            <p className="rating-thanks">
              Thanks for rating! You gave it {userRating} star{userRating !== 1 ? 's' : ''}
            </p>
            {totalRatings > 0 && (
              <div className="average-display">
                <p className="average-rating">
                  Average Rating: {averageRating}/5.0
                </p>
                <p className="rating-count">
                  Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {hasRated && (
          <button
            onClick={resetRating}
            className="reset-button"
            disabled={loading}
          >
            Rate Again
          </button>
        )}
      </div>
    </div>
  );
}