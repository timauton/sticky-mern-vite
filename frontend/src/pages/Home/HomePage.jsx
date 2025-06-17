import { Link } from "react-router-dom";

import "../../index.css";

export function HomePage() {
  return (
    <div className="view">
      <div className="signup-and-login">
      <Link to="/signup" className="signup-link">Sign Up</Link>
      <Link to="/login" className="login-link">Log In</Link>
      </div>
      <h2>It's Sticky!</h2>
      <div className="image-container">
        <img src="/The-archives.jpg" className="responsive-image" alt="the archives" />
      </div>
      <div className="rating-bar-box"></div>
    </div>
  );
}
