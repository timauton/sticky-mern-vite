import { useState } from "react";
import MemeUpload from "./MemeUploadComponent";


const MemeUploadButton = () => {
  // Controls whether the form is visible
  const [isVisible, setIsVisible] = useState(false);

  // Toggles form open/close state
  const toggleForm = () => {
    setIsVisible(prev => !prev);
  };

  return (
    <div className="meme-upload-button">
      {/* Floating Action Button (FAB) */}
      <button className="meme-fab-button" onClick={toggleForm}>
        {isVisible ? "-" : "+"}
      </button>

      {/* Conditionally show the form */}
      {isVisible && <MemeUpload />}
    </div>
  );
};

export default MemeUploadButton;
