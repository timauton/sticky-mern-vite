

import { useState, useRef } from "react";
import { useImageValidation } from "../Hooks/useImageValidationHook";
import { createMeme } from "../services/memeUploadService";

const MemeUpload = () => {
    // State related variables
  const [title, setTitle] = useState(''); // Title of the meme
  const [image, setImage] = useState(null); // The image file
  const fileInputRef = useRef(null); // To reset the file input element
  const [isSuccess, setIsSuccess] = useState(false); // To show success message

  // Using useImageValidator hook with post-specific settings
  const { imageError, validateAndSetError, clearError, resetValidation } =
    useImageValidation({
      maxSize: 5 * 1024 * 1024, // Setting to 5MB for posts
      required: false, // Posts don't require images
    });

  // Called when file is selected
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

  // Called on form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!image){
      return alert('☠️ Silly billy. You forgot to upload your meme! ☠️');
    }

    if (image && !validateAndSetError(image)) {
      return;
    }

    try {
        await createMeme(token, title, image);
      // resets all fields state and the input element after successful upload
      setTitle('');
      setImage(null);
      resetValidation();
      fileInputRef.current.value = '';

      // Show success message
      setIsSuccess(true);
      // If setIsSuccess is true, then after 3000 milliseconds make setIsSuccess false:
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

    } catch (error) {

      if (error.status === 401 || error.message.includes('401')) {
        return alert('🔒 Your session has expired. Please log in and try again.')
      }
      alert('❌ Upload failed. Please try again.')
      console.error(error);
    }
  };

    return(
        <div className="meme-upload-wrapper">
            <div className="meme-upload-title">
                <h3>Upload your meme</h3>
            </div>
            
            <form 
              className="meme-upload-form" 
              onSubmit={handleSubmit}
              aria-label="Upload meme form">
              
              <input 
                type="text" 
                placeholder="Meme title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                data-testid="title-input"
                aria-label="Meme title"/>
      
              <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  ref={fileInputRef} 
                  data-testid="file-input"
                  aria-label="Choose meme image file"
                  required/>
        
              <input 
                  type="submit" 
                  disabled={!image || imageError} 
                  data-testid="submit-button"
                  value="Upload Meme"
                  aria-label="Upload meme to randomizer"
              />
        
              <div aria-live="polite"> 
                  {isSuccess && (
                      <div 
                          className="success-message"
                          role="status"
                          aria-label="Upload successful">
                          ✨✨🥳 Your meme is now in the RANDOMIZER! 🥳✨✨
                      </div>
                  )}                       
              </div>
            </form>
        </div>
    )
};

export default MemeUpload;