const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const getComments = async (meme_id) => {
    const token = localStorage.getItem('token');

    if (!token) { throw new Error("🔓 Please login to view comments 🔓") } 

    const requestOptions = { method: "GET", headers: { Authorization: `Bearer ${token}`} }

    const response = await fetch(`${BACKEND_URL}/comments/meme/${meme_id}`, requestOptions);
 
    if (response.status !== 200) {
        throw new Error ('Unable to fetch stats');
    }

    const data = await response.json();
    return data;
}