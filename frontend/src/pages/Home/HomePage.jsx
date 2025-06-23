import Button from "../../components/ButtonComponent";
import { useState, useEffect, useRef } from "react";
import { Login } from "../../components/Login";
import { Signup } from "../../components/Signup";
import MemeDisplay from "../../components/MemeDisplay";
import { RatingBar } from "../../components/RatingBar";
import MemeUploadButton from "../../components/MemeUploadButtonComponent";
import { useNavigate } from "react-router-dom";
import getMeme from "../../services/memeSelector";

import "../../index.css";

// logged out render
export function HomePage() {
  // Login function
  const [showLogin, setShowLogin] = useState(false);
  const handleLoginClick = () => {
    setShowLogin((prev) => !prev);
    setShowSignup(false);
  };

  // Log out function
  const handleLogOutClick = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  }

  // Signup function
  const [showSignup, setShowSignup] = useState(false);
  const handleSignupClick = () => {
    setShowSignup((prev) => !prev);
    setShowLogin(false);
  };

  // This function will be passed to the Signup component
  const handleSignupSuccess = () => {
    setShowSignup(false); // Hide form
    setShowLogin(true); // Show login form
  };
  
  // For conditional rendering of page
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const handleLoginSuccess = () => {
    setShowLogin(false);
    setIsLoggedIn(true);
  };

  // Meme Display
  const [meme, setMeme] = useState([]);
  let lastMeme = useRef(null); // for back button
  let nextMeme = useRef(null); // for forwards button after having pressed back
  useEffect(() => {
    if (isLoggedIn) {
      updateMeme("next");
    }
  }, [isLoggedIn])

  // Back and forth buttons
  const updateMeme = (id) => {
    if (!isLoggedIn) {
      return;
    }
    const token = localStorage.getItem("token");
    getMeme(token, id).then((data) => {
      setMeme(data.meme);
      localStorage.setItem("token", data.token);
    })
  }

  const handleNextClick = () => {
    lastMeme.current = meme;
    if (nextMeme.current) {
      updateMeme(nextMeme.current._id)
      nextMeme.current = null;
    }
    updateMeme("next");
  }

  const handleBackClick = () => {
    nextMeme.current = meme // sets 'next' button to be previously seen meme
    if (lastMeme.current) {
      updateMeme(lastMeme.current._id);
      lastMeme.current = null;
    }
  }

  const navigate = useNavigate();
  
  if (!isLoggedIn) {
  return (
    <>
      <div className="background-image"></div>
      <div className="background-area">
        <div className="view">
          <div className="signup-and-login">
          <Button className="signup-button" buttonText={"Sign Up"} onClick={handleSignupClick}/>
          {showSignup && <div className="signup-container"><Signup onSignupSuccess={handleSignupSuccess}/>
                        </div>}
          {showLogin && <div className="login-container"><Login onLoginSuccess={handleLoginSuccess}/>
                        </div>}
          <Button className="login-button" buttonText={"Login"} onClick={handleLoginClick}/>
          </div>
          <div className="title">Sticky Memes</div>
          <div className="image-container">TEXT
            <img src="/The-archives.jpg" className="responsive-image" alt="the archives" />
          </div>
          <div className="rating-bar-div">
            <RatingBar />
          </div>
        </div>
      </div>
  </>
  );
  }
  return (
    <>
      <div className="background-image"></div>
      <div className="top-banner">
        <Button
          className="filter-by-tags-button"
          buttonText="Filter Memes"
        />
        <div className="meme-upload-button-wrapper">
          <MemeUploadButton />
        </div>
        <Button
          className="stats-nav-button"
          buttonText="My Stats" // other text is available
          onClick={() => navigate("/stats")}
        />
        <Button
          className="logout-button"
          buttonText="Log Out"
          onClick={handleLogOutClick}
        />
      </div>
      <div className="title">Sticky Memes</div>
      <div className="meme-interface">
        {lastMeme !== null ? (<Button
          className="back-and-forth"
          buttonText="<"
          onClick={handleBackClick}
        />) : (
          <Button
          className="back-and-forth"
          buttonText="<"
          disabled={true}/>
        )}
        <MemeDisplay
          meme={meme}
        />
        <Button
          className="back-and-forth"
          buttonText=">"
          onClick={handleNextClick}
        />
      </div>
    </>
  );
}

