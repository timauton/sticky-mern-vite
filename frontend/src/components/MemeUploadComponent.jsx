

import { useImageValidation } from "../Hooks/useImageValidationHook";
import { createMeme } from "../services/memeUploadService";

const MemeUpload = () => {
    



    return(
        <div className="meme-upload-wrapper">
            <div className="meme-upload-title">
                <h3>Upload your meme</h3>
            </div>
            
            <form className="meme-upload-form">
                    <input type="text" placeholder="Meme title"/>
                    <input type="file" accept="image/*"/>
                    <input type="submit" />
            </form>

        </div>
    )
};

export default MemeUpload;