const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

async function getMeme(tags, token, id) {
    const isPublic = !token;
    const endpoint = isPublic ? `public/${id}` : id;
    
    const requestOptions = {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
    
    const query = tags ? `?tags=${encodeURIComponent(tags)}` : "";
    
    if (token || isPublic) {  // Allow both authenticated AND public calls
        const response = await fetch(`${BACKEND_URL}/memes/${endpoint}${query}`, requestOptions);
        console.log(`${BACKEND_URL}/memes/${endpoint}${query}`);
        
        if (response.status !== 200) {
            throw new Error(`${response.status} Unable to fetch memes`);
        }
        
        const data = await response.json();
        return data;
    }
}

export default getMeme;
