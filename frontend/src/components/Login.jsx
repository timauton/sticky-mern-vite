import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authentication";
import Button from "./ButtonComponent";



export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    console.log("Login Request", {username, password})

    try {
      const token = await login(username, password);
      localStorage.setItem("token", token);
      navigate("/");
    } catch (err) {
      console.error(err);
      // navigate("/login");
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
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
        <Button type="submit" className="submitButton" buttonText="Submit" />
        {/* <input role="submit-button" id="submit" type="submit" value="Submit" /> */}
      </form>
    </>
  );
}
