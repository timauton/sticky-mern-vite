import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import { HomePage } from "./pages/Home/HomePage";
import { StatsPage } from "./pages/Stats/StatsPage";
import MemePage from "./pages/Meme/MemePage";


// docs: https://reactrouter.com/en/main/start/overview
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/stats",
    element: <StatsPage />,
  },
  {
    path: "/meme/:meme_id",
    element: <MemePage />,
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
