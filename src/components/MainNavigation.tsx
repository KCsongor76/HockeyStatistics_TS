import React, {useState} from 'react';
import {NavLink} from 'react-router-dom';
// @ts-ignore
import styles from './MainNavigation.module.css';

interface MainNavigationProps {
    isSignedIn: boolean;
}

const MainNavigation = ({isSignedIn}: MainNavigationProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenuHandler = () => {
        setIsMenuOpen((prevIsMenuOpen) => !prevIsMenuOpen);
    };

    return (
        <nav className={styles.nav}>
            <button
                className={`${styles.navToggle} ${isMenuOpen ? styles.active : ''}`}
                onClick={toggleMenuHandler}>
                <div></div>
                <div></div>
                <div></div>
            </button>
            <ul className={isMenuOpen ? styles.show : ''}>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/start">Start Game</NavLink></li>
                {isSignedIn && (
                    <>
                        <li><NavLink to="/previous_games">Previous Games</NavLink></li>
                        <li><NavLink to="/handleTeams">Teams</NavLink></li>
                        <li><NavLink to="/handlePlayers">Players</NavLink></li>
                        <li><NavLink to="/">Logout</NavLink></li>
                    </>
                )}
                {!isSignedIn && (<li><NavLink to="/admin">Admin Login</NavLink></li>)}
            </ul>
        </nav>
    );
};

export default MainNavigation;
