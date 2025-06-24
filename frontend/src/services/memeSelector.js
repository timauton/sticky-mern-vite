const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

async function getMeme(tags ,token, id) {
    const requestOptions = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    };
    const query = tags ? `?tags=${encodeURIComponent(tags)}` : "";
    if (token) {
        const response = await fetch(`${BACKEND_URL}/memes/${id}${query}`, requestOptions);
        console.log(`${BACKEND_URL}/memes/${id}${query}`)
        if (response.status !==200) {
            throw new Error (`${response.status} Unable to fetch memes`);
        }

        const data = await response.json();
        return data;
    }
}

export default getMeme;