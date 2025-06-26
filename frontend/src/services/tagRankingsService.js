const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const getUserTagRankings = async (userId, token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/users/${userId}/tag-rankings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tag rankings: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tag rankings:', error);
    throw error;
  }
};