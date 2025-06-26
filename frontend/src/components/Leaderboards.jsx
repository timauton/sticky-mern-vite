import { useState, useEffect } from 'react';
import { getTagLeaderboard, getOverallLeaderboard } from '../services/leaderboardService';
import { getCurrentUserId } from '../utils/auth';

const Leaderboards = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('overall'); // 'overall' or 'tag'
  const [tagInput, setTagInput] = useState('');
  const [userRank, setUserRank] = useState(null);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    loadOverallLeaderboard();
  }, []);

  const loadOverallLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userId = getCurrentUserId();
      
      const data = await getOverallLeaderboard(userId, token);
      
      setLeaderboardData(data.leaderboard || []);
      setUserRank(data.userStats?.rank || data.userRank);
      setViewMode('overall');
      setCurrentTag('');
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
    } catch (error) {
      console.error('Error fetching overall leaderboard:', error);
      setError('Failed to load leaderboards');
    } finally {
      setLoading(false);
    }
  };

  const loadTagLeaderboard = async (tag) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userId = getCurrentUserId();
      
      const data = await getTagLeaderboard(userId, tag, token);
      
      setLeaderboardData(data.leaderboard || []);
      setUserRank(data.userRank);
      setViewMode('tag');
      setCurrentTag(tag);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
    } catch (error) {
      console.error('Error fetching tag leaderboard:', error);
      setError(`Failed to load ${tag} leaderboard`);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSubmit = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      loadTagLeaderboard(tagInput.trim().toLowerCase());
    }
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-first';   // Gold
    if (rank === 2) return 'rank-second';  // Silver
    if (rank === 3) return 'rank-third';   // Bronze
    return 'rank-other'; // Gray for #4+
  };

  if (loading) {
    return (
      <div className="card leaderboards-card">
        <h2>Leaderboards</h2>
        <p>Loading leaderboards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card leaderboards-card">
        <h2>Leaderboards</h2>
        <p>{error}</p>
        <button onClick={loadOverallLeaderboard} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="card leaderboards-card">
      <h2>Leaderboards</h2>
      
      {/* Controls */}
      <div className="leaderboard-controls">
        <button 
          onClick={loadOverallLeaderboard}
          className={viewMode === 'overall' ? 'active' : ''}
        >
          Overall Leaderboard
        </button>
        
        <form onSubmit={handleTagSubmit} className="tag-form">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Enter tag (e.g. cats)"
            className="tag-input"
          />
          <button type="submit" className="tag-submit">
            View Tag Leaderboard
          </button>
        </form>
      </div>

      {/* Current View Title */}
      <div className="leaderboard-title">
        <h3>
          {viewMode === 'overall' ? 'Overall Leaderboard' : `${currentTag} Leaderboard`}
        </h3>
        {userRank && (
          <p className="user-rank">Your Rank: #{userRank}</p>
        )}
      </div>

      {/* Leaderboard */}
      {leaderboardData.length === 0 ? (
        <p className="empty-state">No leaderboard data available yet!</p>
      ) : (
        <div className="leaderboard-list">
          {leaderboardData.slice(0, 10).map((user) => (
            <div key={user.username} className={`leaderboard-item ${getRankClass(user.rank)}`}>
              <div className="rank-info">
                <span className="rank-emoji">{getRankEmoji(user.rank)}</span>
                <span className="username">{user.username}</span>
              </div>
              
              <div className="user-stats">
                {viewMode === 'overall' ? (
                  <span className="overall-stats">
                    av. {user.avgRating}⭐ ({user.totalRatings} ratings over {user.totalMemes} memes)
                  </span>
                ) : (
                  <>
                    <span className="avg-rating">{user.avgRating}⭐ avg</span>
                    <span className="stat">{user.totalRated} rated</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboards;