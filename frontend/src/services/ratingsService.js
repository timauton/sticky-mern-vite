
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Takes form data and adds it to GET request.
export const getAllRatingStats = async (meme_id) => {
    const token = localStorage.getItem('token')

    if (!token) { throw new Error("🔓 Please login to view stats 🔓") } 

    const requestOptions = { method: "GET", headers: { Authorization: `Bearer ${token}`} }

    // Sends off the form data to the route /memes/stats. And stores response
    const response = await fetch(`${BACKEND_URL}/ratings/meme/${meme_id}/stats`, requestOptions)

    if (response.status !==201) {
        throw new Error ('Unable to fetch stats');
    }

    const data = await response.json();
    return data;
}