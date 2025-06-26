const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const getUserMemes = async (userId, token, order = 'recent', limit = 5) => {
  const response = await fetch(`${BACKEND_URL}/memes/user/${userId}/ranked?order=${order}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const getUserRatedMemes = async (userId, token, sortBy = 'recent', limit = 10) => {
  // Map frontend sortBy values to backend expected values
  const orderParam = sortBy === 'highest' ? 'rating' : 'recent';
  
  const url = `${BACKEND_URL}/ratings/user/${userId}/ranked?order=${orderParam}&limit=${limit}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch rated memes: ${response.status}`);
  }

  const data = await response.json();
  return data;
};