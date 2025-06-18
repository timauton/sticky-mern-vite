import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  function logOut() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div style={({ textAlign: "center"})}>
      <button onClick={logOut}>Log out</button>;
    </div>
  )
}

export default LogoutButton;
