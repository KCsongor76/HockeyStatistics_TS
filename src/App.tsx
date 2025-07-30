import React, {useEffect, useState} from "react";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import {auth} from "./firebaseConfig";
import {adminUids} from "./adminConfig";
import {onAuthStateChanged} from "firebase/auth";
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
import StartPage2 from "./pages/StartPage2";
import GamePage2 from "./pages/GamePage2";
import PreviousGamesPage2 from "./pages/PreviousGamesPage2";
import {TeamService} from "./OOP/services/TeamService";

// todo: components
// todo: form - no alerts, but errors
// todo: instead of window.confirm()/alert, use maybe custom modals?
// todo: services: oop/atomic/batch writes/etc
// todo: make all files typescript correct
// todo: suspense?

function App() {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isSignedIn, setIsSignedIn] = useState<boolean | undefined>(undefined); // todo: undefined

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Verify if user is admin
                const isAdmin = adminUids.includes(user.uid);
                setIsSignedIn(isAdmin);

                // Redirect non-admin users to home
                if (!isAdmin && window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/';
                }
            } else {
                setIsSignedIn(false);
            }
            setIsLoaded(true);
        });

        return () => unsubscribe();
    }, []);

    TeamService.createFreeAgentTeamIfNotExists();

    const adminRoutes = [
        {
            path: "/",
            element: <RootLayout isSignedIn={true}/>,
            errorElement: <ErrorPage/>,
            children: [
                {index: true, element: <HomePage isSignedIn={isSignedIn}/>},
                {path: "start", element: <StartPage2/>, loader: startPageLoader},
                {path: "game", element: <GamePage2/>},
                {path: "previous_games", element: <PreviousGamesPage2/>},
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
                {path: "admin", element: <Navigate to="/" replace/>}
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
            element: <RootLayout isSignedIn={false}/>,
            errorElement: <ErrorPage/>,
            children: [
                {index: true, element: <HomePage isSignedIn={isSignedIn}/>},
                {path: "start", element: <StartPage/>, loader: startPageLoader},
                {path: "game", element: <GamePage/>},
                {path: "admin", element: <AuthPage/>},
                {path: "*", element: <Navigate to="/admin" replace/>}, // Redirect unauthorized users
            ]
        }
    ]

    const router = createBrowserRouter(
        isLoaded ? (isSignedIn ? adminRoutes : normalRoutes) : placeholderRoutes
    );

    return <RouterProvider router={router}/>;
}

export default App;
