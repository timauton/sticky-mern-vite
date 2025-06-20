import Button from "../../components/ButtonComponent"
import { useState } from "react"
import { Login } from "../../components/Login"
import { Signup } from "../../components/Signup"
import { RatingBar } from "../../components/RatingBar"
import { useNavigate } from "react-router-dom"
// import LogoutButton from "../../components/LogoutButton"

import "../../index.css";

// logged out render
export function HomePage() {

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
          <div className="image-container">
            <img src="/The-archives.jpg" className="responsive-image" alt="the archives" />
          </div>
          {/* <div className="rating-bar-div">
            <RatingBar />
          </div> */} {/* Moved to logged in render */}
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
        <Button
          className="stats-nav-button"
          buttonText="My Stats" // other text is available
          onClick={() => navigate("/stats")}
        />
        <Button
          className="logout-button"
          buttonText="Log Out"
          onClick={() => {localStorage.removeItem("token"); setIsLoggedIn(false);}}
        />
      </div>
      <div className="title">Sticky Memes</div>
      <div className="meme-interface">
        <Button
          className="back-and-forth"
          buttonText="<"
        />
        <div className="image-container">
          <img src="/The-archives.jpg" className="responsive-image" alt="the archives" />
        </div>
        <Button
          className="back-and-forth"
          buttonText=">"
        />
      </div>
      <div className="rating-bar-div">
        <RatingBar />
      </div>
    </>
  );
}

