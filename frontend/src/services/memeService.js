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