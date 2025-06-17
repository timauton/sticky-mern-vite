import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

// Test component with simulated data
export default function StarRatingTest() {
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [existingRatings, setExistingRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulated database functions for testing
  const simulateDbDelay = () => new Promise(resolve => setTimeout(resolve, 500));

  const mockFetchExistingRatings = async (imageId) => {
    await simulateDbDelay();
    // Simulated existing ratings
    return [4, 5, 3, 4, 5, 2, 4, 3, 5, 4];
  };

  const mockSaveRating = async (imageId, rating) => {
    await simulateDbDelay();
    console.log(`Mock: Saved rating ${rating} for image ${imageId}`);
  };

  const mockCheckUserRating = async (imageId) => {
    await simulateDbDelay();
    // Simulate user hasn't rated yet
    return null;
  };

  useEffect(() => {
    const loadRatings = async () => {
      setLoading(true);
      try {
        // Check if user has already rated
        const userExistingRating = await mockCheckUserRating('test-image-123');
        if (userExistingRating) {
          setUserRating(userExistingRating);
          setHasRated(true);
        }

        // Load all ratings for this image
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
      
      // Update average with new rating
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
      // Simulate removing rating from database
      await simulateDbDelay();
      setUserRating(0);
      setHasRated(false);
      setHoveredStar(0);
      
      // Recalculate average without user rating
      if (existingRatings.length > 0) {
        const sum = existingRatings.reduce((acc, rating) => acc + rating, 0);
        setAverageRating((sum / existingRatings.length).toFixed(1));
        setTotalRatings(existingRatings.length);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStarClass = (starIndex) => {
    const currentRating = hoveredStar || userRating;
    let classes = 'star';
    
    if (starIndex <= currentRating) {
      classes += hasRated ? ' star-rated' : ' star-hover';
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
              onClick={() => !hasRated && handleRating(star)}
              onMouseEnter={() => !hasRated && setHoveredStar(star)}
              onMouseLeave={() => !hasRated && setHoveredStar(0)}
              disabled={hasRated || loading}
              className={`star-button ${hasRated || loading ? 'star-button-disabled' : 'star-button-active'}`}
            >
              <Star
                size={32}
                className={getStarClass(star)}
              />
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
        
        <div className="test-info">
          {/* <p><strong>Test Mode:</strong> Simulates database calls with 500ms delays</p>
          <p><strong>Mock Data:</strong> 10 existing ratings ranging from 2-5 stars</p> */}
        </div>
      </div>
    </div>
  );
}