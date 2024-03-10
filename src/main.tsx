import React from "react";
import ReactDOM from "react-dom/client";
import RootPage from "./RootPage";
import TrainPage from "./TrainPage";
import AnalyticsPage from "./AnalyticsPage";
import ImprovisePage from "./ImprovisePage";
import "./styles.css";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import ErrorPage from "./error-page";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootPage/>,
        errorElement: <ErrorPage/>
    }, {
        path: "/train",
        element: <TrainPage/>,
        errorElement: <ErrorPage/>
    }, {
        path: "/improvise",
        element: <ImprovisePage/>,
        errorElement: <ErrorPage/>
    }, {
        path: "/analytics",
        element: <AnalyticsPage/>,
        errorElement: <ErrorPage/>
    }
])

ReactDOM.createRoot(document.getElementById("react-root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
);
