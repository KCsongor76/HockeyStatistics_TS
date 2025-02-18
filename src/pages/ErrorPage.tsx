import React from 'react';
import {useNavigate} from "react-router-dom";

const ErrorPage = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h1>ErrorPage</h1>
            <p>Something went wrong, to go back to the home page, click on the button below</p>
            <button onClick={() => navigate("/")}>Home</button>
        </div>
    );
};

export default ErrorPage;