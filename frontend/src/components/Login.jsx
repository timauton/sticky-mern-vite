import { useState } from "react";
import { login } from "../services/authentication";
import Button from "./ButtonComponent";

import "../index.css";



export function Login({ onLoginSuccess, setErrorMessage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const token = await login(username, password);
      localStorage.setItem("token", token);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setErrorMessage("Incorrect username or password")
      console.error(err);
    }
  }

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username: </label>
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
        <Button type="submit" className="login-submit-button" buttonText="Submit" />
      </form>
    </>
  );
}
