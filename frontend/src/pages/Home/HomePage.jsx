import Button from "../../components/ButtonComponent";
import { useState, useEffect, useRef } from "react";
import { Login } from "../../components/Login";
import { Signup } from "../../components/Signup";
import MemeDisplay from "../../components/MemeDisplay";
import MemeUploadButton from "../../components/MemeUploadButtonComponent";
import { useNavigate } from "react-router-dom";
import getMeme from "../../services/memeSelector";
import { TagFilter } from "../../components/TagFilter"
import Comments from "../../components/Comments"
import ShareButton from "../../components/ShareButtonComponent"
import "../../index.css";

export function HomePage() {
  // Reusable error message (?) see updateMeme for usage
  const [errorMessage, setErrorMessage] = useState("")

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

  // Filter by tags
  const [showTagFilter, setShowTagFilter] = useState(false);
  const handleTagFilter = () => {
    setShowTagFilter((prev) => !prev);
  }

  const [tags, setTags] = useState([]);

  // Meme Display
  const [meme, setMeme] = useState([]);
  let lastMeme = useRef(null);
  useEffect(() => {
    if (isLoggedIn) {
      updateMeme("next");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  // Back and forth buttons
  const updateMeme = (id) => {
    const token = localStorage.getItem("token");
    getMeme(tags.join(","), token, id).then((data) => {
      if (!data || !data.meme) {
        setErrorMessage("No memes found with those tags")
        setTags([])
      } else {
      setMeme(data.meme);
      localStorage.setItem("token", data.token);
      }
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
      </div>
  </>
  );
  }
  return (
    <>
      <div className="background-image"></div>
        <div className="background-area">
          {errorMessage && (
                  <div className="error-display">
                    <button className="close-error" onClick={() => setErrorMessage("")}>
                      &times;
                    </button>
                    <p className="error-message">
                    {errorMessage}
                    </p>
                  </div>
                )}
          <div className="top-banner">
            <Button
              className="filter-by-tags-button"
              buttonText="Filter Memes"
              onClick={handleTagFilter}
            />
            <Button
              className="logout-button"
              buttonText="Log Out"
              onClick={handleLogOutClick}
            />
          </div>
          <div className="title">Sticky Memes</div>
    {/* Start of the column layout */}
          <div className="row">
            <div className="column-view-left">
              <div className="meme-tags">
                {showTagFilter && <TagFilter value={tags} onTagChange={setTags}/>}
                <br />
                <br />
                <p className="meme-tags-title">Tags for this meme:
                <br />
                  {meme && Array.isArray(meme.tags) && meme.tags.map( (tag, index) => {
                    return <span className="meme-tag" key={index}>{tag} </span>
                  })}
                </p>
              </div>
              <ShareButton meme={meme}/>
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
                <Comments meme={meme} />
            </div>
            <div className="column-view-right">
              <div className="meme-upload-button-wrapper">
                <MemeUploadButton />
              </div>
              <br />
              <Button
              className="stats-nav-button"
              buttonText={"My\nStats"} // other text is available
              onClick={() => navigate("/stats")}
            />
          </div>
        </div>
      </div>  
    </>
  );
}



