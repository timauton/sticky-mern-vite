
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Takes form data and adds it to GET request.
export const getAllRatingStats = async (meme_id) => {
    const token = localStorage.getItem('token');

    if (!token) { throw new Error("🔓 Please login to view stats 🔓") } 

    const requestOptions = { method: "GET", headers: { Authorization: `Bearer ${token}`} }

    // Sends off the form data to the route /memes/stats. And stores response
    const response = await fetch(`${BACKEND_URL}/ratings/meme/${meme_id}/stats`, requestOptions)

    if (response.status !==200) {
        throw new Error ('Unable to fetch stats');
    }

    const data = await response.json();
    return data;
}

export const submitUserRating = async(meme_id, rating) => {
    const token = localStorage.getItem('token');

    if (!token) { throw new Error("🔓 Please login to submit rating 🔓") } 

    const requestOptions = { method: "POST", headers: 
        { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`}, body:JSON.stringify({
            meme: meme_id,
            rating: rating
    }) }

    const response = await fetch(`${BACKEND_URL}/ratings`, requestOptions)

    if (response.status !==201) {
        throw new Error ('Unable to fetch ratings');
    }

    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
    }
    return data;

}

export const getUserRating = async(meme_id) => {
    const token = localStorage.getItem('token');

    if (!token) { throw new Error("🔓 Please login to view rating 🔓") } 

    const requestOptions = { method: "GET", headers: { Authorization: `Bearer ${token}`} }

    const response = await fetch(`${BACKEND_URL}/ratings/meme/${meme_id}/current`, requestOptions)

    if (response.status !==200) {
        throw new Error ('Unable to fetch user rating');
    }

    const data = await response.json();
    return data;
}