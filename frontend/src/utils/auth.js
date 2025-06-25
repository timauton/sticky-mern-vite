export const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No token found');
  }

  try {
    // Decode JWT payload (middle part of token)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // 'sub' is the user ID in your JWT
  } catch (error) {
    throw new Error('Invalid token');
  }
};