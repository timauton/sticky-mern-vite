import Button from "../../components/ButtonComponent"
import  { useState } from "react"
import { Login } from "../../components/Login"
import { Signup } from "../../components/Signup"
// import LogoutButton from "../../components/LogoutButton"

import "../../index.css";


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

  return (
    <div className="view">
      <div className="signup-and-login">
       <Button className="signup-button" buttonText={"Sign Up"} onClick={handleSignupClick}/>
      {showLogin && <div className="login-container"><Login />
                    </div>}
      <Button className="login-button" buttonText={"Login"} onClick={handleLoginClick}/>
      {showSignup && <div className="signup-container"><Signup />
                    </div>}
      </div>
      <div className="title">It is Sticky!</div>
      <div className="image-container">
        <img src="/The-archives.jpg" className="responsive-image" alt="the archives" />
      </div>
      <div className="rating-bar-box"></div>
    </div>
  );
}
