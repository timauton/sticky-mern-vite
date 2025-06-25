const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function getTags() {
    const response = await fetch(`${BACKEND_URL}/memes/tags`);

    if (response.status !== 200) {
        throw new Error("Failed to fetch tags");
    }
    const data = await response.json();
    return data.tags;
}