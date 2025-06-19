

import { useState, useRef } from "react";
import { useImageValidation } from "../Hooks/useImageValidationHook";
import { createMeme } from "../services/memeUploadService";

const MemeUpload = () => {
    // State related variables
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Using useImageValidator hook with post-specific settings
  const { imageError, validateAndSetError, clearError, resetValidation } =
    useImageValidation({
      maxSize: 5 * 1024 * 1024, // Setting to 5MB for posts
      required: false, // Posts don't require images
    });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const isValid = validateAndSetError(selectedFile);
      if (isValid) {
        setImage(selectedFile);
      } else {
        setImage(null);
        fileInputRef.current.value = ''; // Clear input if file is invalid
      }
    } else {
      setImage(null);
      clearError(); // Clears any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!image){
      return alert('☠️ You forgot to upload your meme! ☠️');
    }

    if (image && !validateAndSetError(image)) {
      return;
    }

    try {
        await createMeme(token, title, image);
      // resets state and the input element
      setTitle('');
      setImage(null);
      resetValidation();
      fileInputRef.current.value = '';

      setIsSuccess(true);

    } catch (error) {
      console.error(error);
    }
  };




    return(
        <div className="meme-upload-wrapper">
            <div className="meme-upload-title">
                <h3>Upload your meme</h3>
            </div>
            
            <form className="meme-upload-form" onSubmit={handleSubmit}> {/* <--- Runs the handleSubmit function above */}
                    <input type="text" placeholder="Meme title" value={title} onChange={(e) => setTitle(e.target.value)}/> {/* <--- Renders user input to the screen */}
                    <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef}/> {/* <--- Runs the handleSubmit function above */}
                    <input type="submit" disabled={!image || imageError} />
                    <div> 
                        {isSuccess && (<div className="success-message">✨✨🥳 Meme now in the RANDOMIZER! 🥳✨✨</div>)}                       
                    </div>
            </form>

        </div>
    )
};

export default MemeUpload;