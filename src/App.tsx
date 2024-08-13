import React, {useEffect, useState} from "react";
// @ts-ignore
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


function App() {

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

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
                {path: "start", element: <StartPage/>},
                {path: "game", element: <GamePage/>},
                {path: "previous_games", element: <PreviousGamesPage/>},
                {path: "previous_games/:gameId", element: <PreviousGameDetailPage/>},
                {
                    path: "handleTeams",
                    children: [
                        {index: true, element: <TeamCRUDPage/>},
                        {path: "create", element: <CreateTeamPage/>},
                        {path: ":teamId", element: <HandleTeamPage/>},
                    ],
                },
                {
                    path: "handlePlayers",
                    children: [
                        {index: true, element: <PlayerCRUDPage/>},
                        {path: "create", element: <CreatePlayerPage/>},
                        {path: "transfer", element: <TransferPlayerPage/>},
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
