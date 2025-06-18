import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import { HomePage } from "./pages/Home/HomePage";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { FeedPage } from "./pages/Feed/FeedPage";


// docs: https://reactrouter.com/en/main/start/overview
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
