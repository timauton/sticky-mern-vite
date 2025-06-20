const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

async function getMeme(token, id) {
    const requestOptions = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    };

    const response = await fetch(`${BACKEND_URL}/memes/${id}`, requestOptions);

    if (response.status !==200) {
        throw new Error (`${response.status} Unable to fetch memes`);
    }

    const data = await response.json();
    return data;
}

export default getMeme;