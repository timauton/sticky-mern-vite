import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import getMeme from "../../services/memeSelector"
import MemeDisplay from "../../components/MemeDisplay";

const MemePage = () => {
    // Get meme ID from URL
    const params = useParams();
    const memeId = params.meme_id;
    
    // State to store the fetched meme
    const [meme, setMeme] = useState(null);
    
    // Fetch data when component mounts
    useEffect(() => {
        const fetchMeme = async () => {
            const token = localStorage.getItem("token");
            const data = await getMeme(token, memeId);
            setMeme(data.meme);
        };
        
        fetchMeme();
    }, [memeId]);
    
    // Show loading while fetching
    if (!meme) {
        return <div>Loading...</div>;
    }
    
    // Display the meme title (simplest possible)
    return(
        <div>
            <MemeDisplay meme={meme} />
        </div>
    )
};

export default MemePage;