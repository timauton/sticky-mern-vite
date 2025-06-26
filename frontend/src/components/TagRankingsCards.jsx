import { useState, useEffect } from 'react';
import { getUserTagRankings } from '../services/tagRankingsService';
import { getCurrentUserId } from '../utils/auth';

const TagRankingsCards = () => {
  const [rankings, setRankings] = useState([]);  // Array instead of object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const userId = getCurrentUserId();
        
        const data = await getUserTagRankings(userId, token);
        
        // Backend returns: { userOverallStats: {...}, tagRankings: [...], token: '...' }
        const rankingsArray = data.tagRankings || [];
        
        setRankings(rankingsArray);
        
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      } catch (error) {
        console.error('Error fetching tag rankings:', error);
        setError('Failed to load rankings');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-first';
    if (rank <= 2) return 'rank-top-two';
    if (rank <= 3) return 'rank-top-three';
    return 'rank-other';
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '📊';
  };

  if (loading) {
    return (
      <div className="card tag-rankings-card">
        <h2>Tag Rankings</h2>
        <p>Loading your rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card tag-rankings-card">
        <h2>Tag Rankings</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Handle array format from your backend
  if (!Array.isArray(rankings) || rankings.length === 0) {
    return (
      <div className="card tag-rankings-card">
        <h2>Tag Rankings</h2>
        <p>No rankings yet. Start rating some memes!</p>
      </div>
    );
  }

  return (
    <div className="card tag-rankings-card">
      <h2>Tag Rankings</h2>
      <div className="rankings-grid">
        {rankings.map((rankData) => (
          <div 
            key={rankData.tag} 
            className={`tag-ranking-card ${getRankClass(rankData.userRank)}`}
          >
            <div className="rank-header">
              <span className="rank-emoji">{getRankEmoji(rankData.userRank)}</span>
              <span className="rank-number">#{rankData.userRank}</span>
            </div>
            
            <h3 className="tag-name">{rankData.tag}</h3>
            
            <div className="rank-details">
              <p className="total-users">out of {rankData.totalUsers} users</p>
              <div className="stats-row">
                <span className="average-rating">{rankData.userAvgRating}⭐ avg</span>
                <span className="total-rated">{rankData.userMemeCount} rated</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagRankingsCards;