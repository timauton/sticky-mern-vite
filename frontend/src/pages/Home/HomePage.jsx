import { Link } from "react-router-dom";
import Button from "../../components/ButtonComponent"
import Login from "../../components/Login"
import LogoutButton from "../../components/LogoutButton"

import "../../index.css";

// logged out render
export function HomePage() {


  return (
    <div className="view">
      <div className="signup-and-login">
      <Link to="/signup" className="signup-link">Sign Up</Link>
      {/* <Link to="/login" className="login-link">Log In</Link> */}
      <div className="form-container"></div>
      <Button className="login-button" buttonText={"Login"}/>
      </div>
      <div className="title">It is Sticky!</div>
      <div className="image-container">
        <img src="/The-archives.jpg" className="responsive-image" alt="the archives" />
      </div>
      <div className="rating-bar-box"></div>
    </div>
  );
}
