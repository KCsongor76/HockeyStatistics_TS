import React from 'react';
import {useNavigate, useRouteError} from "react-router-dom";
// @ts-ignore
import styles from './ErrorPage.module.css';

// todo: implement routing error logic

const ErrorPage = () => {
    const navigate = useNavigate();
    const error = useRouteError()

    console.log(error)

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.errorCode}>404</h1>
                <div className={styles.divider}></div>
                <h2 className={styles.title}>Page Not Found</h2>
                <p className={styles.message}>
                    Oops! The page you're looking for seems to have gotten lost in space.
                </p>
                <button
                    className={styles.button}
                    onClick={() => navigate("/")}
                >
                    Return Home
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;