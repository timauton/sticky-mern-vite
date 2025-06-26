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

export const createComment = async (meme_id, comment) => {
    const token = localStorage.getItem('token');

    if (!token) { throw new Error("🔓 Please login to make a comment 🔓") } 

    const requestOptions = {
            method: 'POST',
            headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment, meme_id })
    }

    const response = await fetch(`${BACKEND_URL}/comments`, requestOptions);

    if (response.status !==201) {
        throw new Error ('Unable to create comment');
    }

    const data = await response.json();
    return data;
}