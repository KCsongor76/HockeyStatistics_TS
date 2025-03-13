import React, {useState} from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
// @ts-ignore
import styles from './MainNavigation.module.css';
import {auth} from '../firebaseConfig';
import {signOut} from "firebase/auth"; // Add this import

interface MainNavigationProps {
    isSignedIn: boolean;
}

const MainNavigation = ({isSignedIn}: MainNavigationProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            if (window.confirm('Are you sure you want to sign out?')) {
                await signOut(auth);
                localStorage.removeItem('token');
                navigate('/');
            }
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

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

                {isSignedIn === undefined && (
                    <li style={{color: '#fff', padding: '10px 20px'}}>Loading...</li>
                )}

                {isSignedIn && (
                    <>
                        <li><NavLink to="/previous_games">Previous Games</NavLink></li>
                        <li><NavLink to="/handleTeams">Teams</NavLink></li>
                        <li><NavLink to="/handlePlayers">Players</NavLink></li>
                        <li><NavLink to="/" onClick={handleLogout}>Logout</NavLink></li>
                    </>
                )}

                {/* Unauthenticated link */}
                {!isSignedIn && isSignedIn !== undefined && (
                    <li><NavLink to="/admin">Admin Login</NavLink></li>
                )}
            </ul>
        </nav>
    );
};

export default MainNavigation;
