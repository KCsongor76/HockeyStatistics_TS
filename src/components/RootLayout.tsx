import React from 'react';
// @ts-ignore
import {Outlet} from 'react-router-dom';
import MainNavigation from "./MainNavigation";

const RootLayout = () => {
    return (
        <>
            <MainNavigation isSignedIn={false}/>
            <main><Outlet/></main>
        </>
    );
};

export default RootLayout;