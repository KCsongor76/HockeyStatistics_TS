import React from 'react';
import {useNavigate, useRouteError, isRouteErrorResponse} from "react-router-dom";
// @ts-ignore
import styles from './ErrorPage.module.css';

const ErrorPage = () => {
    const navigate = useNavigate();
    const error = useRouteError();

    let title = "Something went wrong";
    let message = "An unexpected error occurred.";
    let errorCode = "Error";

    if (isRouteErrorResponse(error)) {
        errorCode = error.status.toString();
        title = error.statusText;
        message = error.data || "Sorry, we couldn't find what you were looking for.";

        console.log(error);
        console.log(message);
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.errorCode}>{errorCode}</h1>
                <div className={styles.divider}></div>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
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
