import Button from "../../components/ButtonComponent"
import  { useState } from "react"
import { Login } from "../../components/Login"
import { Signup } from "../../components/Signup"
import { RatingBar } from "../../components/RatingBar"
// import LogoutButton from "../../components/LogoutButton"

import "../../index.css";

// logged out render
export function HomePage() {

  // Login function
  const [showLogin, setShowLogin] = useState(false);
  const handleLoginClick = () => {
    setShowLogin((prev) => !prev);
  };

  // Signup function
  const [showSignup, setShowSignup] = useState(false);
  const handleSignupClick = () => {
    setShowSignup((prev) => !prev);
  };

  // This function will be passed to the Signup component
  const handleSignupSuccess = () => {
    setShowSignup(false); // Hide form
    setShowLogin(true); // Show login form
  }


  return (
    <>
      <div className="background-image"></div>
      <div className="background-area">
        <div className="view">
          <div className="signup-and-login">
          <Button className="signup-button" buttonText={"Sign Up"} onClick={handleSignupClick}/>
          {showSignup && <div className="signup-container"><Signup onSignupSuccess={handleSignupSuccess}/>
                        </div>}
          {showLogin && <div className="login-container"><Login />
                        </div>}
          <Button className="login-button" buttonText={"Login"} onClick={handleLoginClick}/>
          </div>
          <div className="title">Sticky Memes</div>
          <div className="image-container">
            <img src="/The-archives.jpg" className="responsive-image" alt="the archives" />
          </div>
          <div className="rating-bar-box">
            <RatingBar />
          </div>
        </div>
      </div>
  </>
  );
}