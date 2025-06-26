const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const getTagLeaderboard = async (userId, tag, token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/users/${userId}/tag-rankings/${tag}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tag leaderboard: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tag leaderboard:', error);
    throw error;
  }
};

export const getOverallLeaderboard = async (userId, token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/users/${userId}/overall-leaderboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch overall leaderboard: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching overall leaderboard:', error);
    throw error;
  }
};