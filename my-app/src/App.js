// App.js
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DengueDataList from "./Components/DengueDataList"; // Adjust the path if needed
import Home from "./Components/Home";
import Add from "./Components/AddDengueData";
import Map from "./Components/DataVis"

// Define routes for the app
const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/List",
    element: <DengueDataList />,
  },
  {
    path: "/Add",
    element: <Add />,
  },
  {
    path: "/Map",
    element: <Map />,
  },
];

// Create the router with future flags
const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
