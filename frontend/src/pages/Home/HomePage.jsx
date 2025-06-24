import Button from "../../components/ButtonComponent"
import { useState, useEffect, useRef } from "react"
import { Login } from "../../components/Login"
import { Signup } from "../../components/Signup"
import MemeDisplay from "../../components/MemeDisplay"
import MemeUploadButton from "../../components/MemeUploadButtonComponent"
import { useNavigate } from "react-router-dom"
import getMeme from "../../services/memeSelector"

import "../../index.css";

// logged out render
export function HomePage() {
  // Meme Display
  const [meme, setMeme] = useState([]);
  let lastMeme = useRef(null);
  useEffect(() => {
    updateMeme("next");
  }, [])

  // Back and forth buttons
  const updateMeme = (id) => {
    const token = localStorage.getItem("token");
    getMeme(token, id).then((data) => {
      setMeme(data.meme);
      localStorage.setItem("token", data.token);
    })
  }

  const handleNextClick = () => {
    lastMeme.current = meme;
    console.log("LAST MEME", lastMeme)
    updateMeme("next");
  }

  const handleBackClick = () => {
    if (lastMeme.current) {
      updateMeme(lastMeme.current._id);
      lastMeme.current = null;
    }
  }

  // Login function
  const [showLogin, setShowLogin] = useState(false);
  const handleLoginClick = () => {
    setShowLogin((prev) => !prev);
    setShowSignup(false)
  };

  // Signup function
  const [showSignup, setShowSignup] = useState(false);
  const handleSignupClick = () => {
    setShowSignup((prev) => !prev);
    setShowLogin(false)
  };

  // This function will be passed to the Signup component
  const handleSignupSuccess = () => {
    setShowSignup(false); // Hide form
    setShowLogin(true); // Show login form
  };
  
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLoginSuccess = () => {
    setShowLogin(false)
    setIsLoggedIn(true)
  };

  const navigate = useNavigate();
  
  if (!isLoggedIn) {
  return (
    <>
      <div className="background-image"></div>
      <div className="background-area">
          <div className="top-banner">
          <Button className="signup-button" buttonText={"Sign Up"} onClick={handleSignupClick}/>
          {showSignup && <div className="signup-container"><Signup onSignupSuccess={handleSignupSuccess}/>
                        </div>}
          {showLogin && <div className="login-container"><Login onLoginSuccess={handleLoginSuccess}/>
                        </div>}
          <Button className="login-button" buttonText={"Login"} onClick={handleLoginClick}/>
          </div>
          <div className="title">Sticky Memes</div>
          <div className="image-container">
            <img src="/The-archives.jpg" className="responsive-image" alt="the archives" />
          </div>
          {/* <div className="rating-bar-div">
            <RatingBar />
          </div> */} {/* Moved to logged in render */}
      </div>
  </>
  );
  }
  return (
    <>
      <div className="background-image"></div>
        <div className="background-area">
          <div className="top-banner">
            <Button
              className="filter-by-tags-button"
              buttonText="Filter Memes"
            />
            <Button
              className="stats-nav-button"
              buttonText={"My\nStats"} // other text is available
              onClick={() => navigate("/stats")}
            />
            <Button
              className="logout-button"
              buttonText="Log Out"
              onClick={() => {localStorage.removeItem("token"); setIsLoggedIn(false);}}
            />
          </div>
          <div className="title">Sticky Memes</div>
    {/* Start of the column layout */}
          <div className="row">
            <div className="column-view-left">
              <div className="meme-tags">
                <p className="meme-tags-title">Tagged:
                  {Array.isArray(meme.tags) && meme.tags.map( (tag, index) => {
                    return <span className="meme-tag" key={index}>{tag} </span>
                  })}
                </p>
              </div>
            </div>
            <div className="column-view-middle">
              <div className="meme-interface">
                <MemeDisplay
                  meme={meme}
                />
              </div>
              <div className="button-box">
                {lastMeme !== null ? (<Button
                  className="back-and-forth left"
                  buttonImage="./left-arrow.png"
                  onClick={handleBackClick}
                />) : (
                  <Button
                  className="back-and-forth left"
                  buttonImage="./left-arrow.png"
                  disabled={true}>
                  </Button>
                )}
                  <Button
                  className="back-and-forth right"
                  buttonImage="./right-arrow.png"
                  onClick={handleNextClick}
                />
              </div>
            </div>
            <div className="column-view-right">
              <div className="meme-upload-button-wrapper">
                <MemeUploadButton />
              </div>
          </div>
        </div>
      </div>  
    </>
  );
}


