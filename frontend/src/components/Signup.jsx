import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signup } from "../services/authentication";
import Button from "./ButtonComponent";

import "../index.css";

export function Signup({onSignupSuccess}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    // check output
    console.log('signing up with:', {username, password, email})
    try {
      await signup(username, password, email);
      navigate("/");
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch (err) {
      console.error(err);
      // navigate("/signup");
    }
  }

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username"> Username: </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
        />
        <label htmlFor="password"> Password: </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
        <br />
          <div className="email-input"> 
          <label htmlFor="email"> Email: </label>
          <input
          id="email"
          type="text"
          value={email}
          onChange={handleEmailChange}
        />
        <Button type="submit" className="signup-submit-button" buttonText="Submit" />
        </div>
      </form>
    </>
  );
}
