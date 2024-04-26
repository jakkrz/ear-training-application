import React from "react";
import ReactDOM from "react-dom/client";

import RootPage from "./RootPage";
import TrainPage from "./TrainPage";
import AnalyticsPage from "./AnalyticsPage";
import ImprovisePage from "./ImprovisePage";

import "./styles.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorPage from "./error-page";
import PlayNotesByEarConfigPage from "./trainings/exercises/PlayNotesByEarConfigPage";
import PlayNotesByEarPage from "./trainings/exercises/PlayNotesByEarPage";
import StaffWarsPage from "./trainings/games/StaffWarsPage";
import StaffWarsConfigPage from "./trainings/games/StaffWarsConfigPage";
import PlayChordsByNamePage from "./trainings/exercises/PlayChordsByNamePage";
import PlayChordsByNameConfigPage from "./trainings/exercises/PlayChordsByNameConfigPage";
import PlayNotesByEarTestConfigPage from "./trainings/tests/PlayNotesByEarConfigPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/train",
        element: <TrainPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/improvise",
        element: <ImprovisePage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/analytics",
        element: <AnalyticsPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/train/exercises/play-notes-by-ear/config",
        element: <PlayNotesByEarConfigPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/train/exercises/play-notes-by-ear/actual",
        element: <PlayNotesByEarPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/train/games/staff-wars/actual",
        element: <StaffWarsPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/train/games/staff-wars/config",
        element: <StaffWarsConfigPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/train/exercises/play-chords-by-name/config",
        element: <PlayChordsByNameConfigPage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/train/exercises/play-chords-by-name/actual",
        element: <PlayChordsByNamePage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/train/tests/play-notes-by-ear/config",
        element: <PlayChordsByNamePage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/train/tests/play-notes-by-ear/config",
        element: <PlayNotesByEarTestConfigPage />,
        errorElement: <ErrorPage />,
    },
]);

ReactDOM.createRoot(
    document.getElementById("react-root") as HTMLElement,
).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
