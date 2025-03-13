import React from 'react';
import { Outlet } from 'react-router-dom';
import MainNavigation from "./MainNavigation";
// @ts-ignore
import styles from './RootLayout.module.css';

interface RootLayoutProps {
    isSignedIn: boolean;
}

const RootLayout = ({ isSignedIn }: RootLayoutProps) => {
    return (
        <div className={styles.rootLayout}>
            <MainNavigation isSignedIn={isSignedIn}/>
            <main className={styles.mainContent}>
                <Outlet/>
            </main>
        </div>
    );
};

export default RootLayout;