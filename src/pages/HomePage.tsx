import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
// @ts-ignore
import styles from './HomePage.module.css';
import {auth} from '../firebaseConfig';
import {signOut} from "firebase/auth";

interface HomePageProps {
    isSignedIn: boolean | undefined;
}

const HomePage: React.FC<HomePageProps> = ({isSignedIn}) => {
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

    const [menuItems, setMenuItems] = useState([{
        title: 'Start New Game',
        description: 'Begin a new hockey game tracking session',
        icon: '🏒', // Hockey stick emoji
        path: '/start',
        onClick: () => {}
    }]);

    useEffect(() => {
        if (isSignedIn) {
            setMenuItems([
                {
                    title: 'Start New Game',
                    description: 'Begin a new hockey game tracking session',
                    icon: '🏒',
                    path: '/start'
                },
                {
                    title: 'Previous Games',
                    description: 'Review and analyze past game records',
                    icon: '📊',
                    path: '/previous_games'
                },
                {
                    title: 'Manage Teams',
                    description: 'Create, edit, and manage hockey teams',
                    icon: '🏆',
                    path: '/handleTeams'
                },
                {
                    title: 'Manage Players',
                    description: 'Add, transfer, and track player information',
                    icon: '👥',
                    path: '/handlePlayers'
                },
                {
                    title: 'Log Out',
                    description: 'Sign out of your admin account',
                    icon: '🔒',
                    onClick: handleLogout // Changed from path to onClick
                }
            ]);
        } else {
            setMenuItems([
                {
                    title: 'Start New Game',
                    description: 'Begin a new hockey game tracking session',
                    icon: '🏒',
                    path: '/start'
                },
                {
                    title: 'Admin Login',
                    description: 'Access admin features',
                    icon: '🔑',
                    path: '/admin'
                }
            ]);
        }
    }, [isSignedIn]);

    return (
        <div className={styles.homeContainer}>
            <header className={styles.header}>
                <h1>Hockey Game Tracker</h1>
                <p>Your comprehensive hockey game management platform</p>
            </header>

            <div className={styles.menuGrid}>
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        className={styles.menuItem}
                        onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
                    >
                        <div className={styles.menuItemIcon}>{item.icon}</div>
                        <div className={styles.menuItemContent}>
                            <h2>{item.title}</h2>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;