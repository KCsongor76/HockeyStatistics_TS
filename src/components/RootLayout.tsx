import React from 'react';
import { Outlet } from 'react-router-dom';
import MainNavigation from "./MainNavigation";
// @ts-ignore
import styles from './RootLayout.module.css';

const RootLayout = () => {
    return (
        <div className={styles.rootLayout}>
            <MainNavigation isSignedIn={true}/>
            <main className={styles.mainContent}>
                <Outlet/>
            </main>
        </div>
    );
};

export default RootLayout;