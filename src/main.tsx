import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import HomePage from "./pages/Home";
import DashboardPage from "./pages/Giveaway";
import LeaderboardPage from "./pages/Leaderboard";
import Staking from "./pages/Staking";
import StakingBBP from "./pages/StakingBBP";

import Stats from "./pages/Stats";
import PdfRedirect from "./pages/PdfRedirect";  

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage  />,
      },
      {
        path: "/raffle",
        element: <DashboardPage />,
      },
      {
        path: "/leaderboard",
        element: <LeaderboardPage />,
      },
      {
        path: "/staking",
        element: <Staking />,
      },
      {
        path: "/stakingbbp",
        element: <StakingBBP />,
      },      
      {
        path: "/stats",
        element: <Stats />,
      },
      {
        path: "/wp", // Add the new route
        element: <PdfRedirect />,
      },      
    ],
  },
]);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
