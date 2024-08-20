import React, {useEffect, useState} from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import "./App.css";
import RootLayout from "./components/RootLayout";
import ErrorPage from "./pages/ErrorPage";
import HomePage from "./pages/HomePage";
import StartPage from "./pages/StartPage";
import GamePage from "./pages/GamePage";
import AuthPage from "./pages/AuthPage";
import PreviousGamesPage from "./pages/PreviousGamesPage";
import PreviousGameDetailPage from "./pages/PreviousGameDetailPage";
import TeamCRUDPage from "./pages/TeamCRUDPage";
import CreateTeamPage from "./pages/CreateTeamPage";
import HandleTeamPage from "./pages/HandleTeamPage";
import PlayerCRUDPage from "./pages/PlayerCRUDPage";
import CreatePlayerPage from "./pages/CreatePlayerPage";
import TransferPlayerPage from "./pages/TransferPlayerPage";
import {loader as startPageLoader} from "./pages/StartPage";
import {loader as teamCRUDPageLoader} from "./pages/TeamCRUDPage";
import {loader as CreatePlayerPageLoader} from "./pages/CreatePlayerPage";
import {loader as playerCRUDPageLoader} from "./pages/PlayerCRUDPage";
import HandlePlayerPage from "./pages/HandlePlayerPage";

function App() {

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isSignedIn, setIsSignedIn] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsSignedIn(true);
        }
        setIsLoaded(true);
    }, []);

    const adminRoutes = [
        {
            path: "/",
            element: (
                <RootLayout/>
            ),
            errorElement: <ErrorPage/>,
            children: [
                {index: true, element: <HomePage/>},
                {path: "start", element: <StartPage/>, loader: startPageLoader},
                {path: "game", element: <GamePage/>},
                {path: "previous_games", element: <PreviousGamesPage/>},
                {path: "previous_games/:gameId", element: <PreviousGameDetailPage/>},
                {
                    path: "handleTeams",
                    children: [
                        {index: true, element: <TeamCRUDPage/>, loader: teamCRUDPageLoader},
                        {path: "create", element: <CreateTeamPage/>,},
                        {path: ":id", element: <HandleTeamPage/>},
                    ],
                },
                {
                    path: "handlePlayers",
                    children: [
                        {index: true, element: <PlayerCRUDPage/>, loader: playerCRUDPageLoader},
                        {path: "create", element: <CreatePlayerPage/>, loader: CreatePlayerPageLoader},
                        {path: ":id", element: <HandlePlayerPage/>},
                        {path: "transfer/:id", element: <TransferPlayerPage/>},
                    ],
                },
            ],
        },
    ];

    const placeholderRoutes = [
        {
            path: "*",
            element: <p>Loading...</p>,
            errorElement: <ErrorPage/>,
        },
    ];

    const normalRoutes = [
        {
            path: "/",
            element: <RootLayout/>,
            errorElement: <ErrorPage/>,
            children: [
                {index: true, element: <HomePage/>},
                {
                    path: "start",
                    element: <StartPage/>,
                    loader: startPageLoader
                },
                {path: "game", element: <GamePage/>},
                {path: "admin", element: <AuthPage/>},
            ]
        }
    ]

    const router = createBrowserRouter(
        isLoaded ? (isSignedIn ? adminRoutes : normalRoutes) : placeholderRoutes
    );
    return <RouterProvider router={router}/>;
}

export default App;
