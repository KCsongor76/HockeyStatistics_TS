import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
// @ts-ignore
import styles from './HomePage.module.css';

interface HomePageProps {
    isSignedIn: boolean | undefined;
}

const HomePage: React.FC<HomePageProps> = ({isSignedIn: isSignedIn}) => {
    const navigate = useNavigate();

    const [menuItems, setMenuItems] = useState([{
        title: 'Start New Game',
        description: 'Begin a new hockey game tracking session',
        icon: '🏒', // Hockey stick emoji
        path: '/start'
    }]);

    useEffect(() => {
        if (isSignedIn) {
            setMenuItems([
                {
                    title: 'Start New Game',
                    description: 'Begin a new hockey game tracking session',
                    icon: '🏒', // Hockey stick emoji
                    path: '/start'
                },
                {
                    title: 'Previous Games',
                    description: 'Review and analyze past game records',
                    icon: '📊', // Bar chart emoji
                    path: '/previous_games'
                },
                {
                    title: 'Manage Teams',
                    description: 'Create, edit, and manage hockey teams',
                    icon: '👥', // Team emoji
                    path: '/handleTeams'
                },
                {
                    title: 'Manage Players',
                    description: 'Add, transfer, and track player information',
                    icon: '🏆', // Trophy emoji
                    path: '/handlePlayers'
                }
            ]);
        } else {
            setMenuItems([
                {
                    title: 'Start New Game',
                    description: 'Begin a new hockey game tracking session',
                    icon: '🏒', // Hockey stick emoji
                    path: '/start'
                },
            ])
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
                        onClick={() => navigate(item.path)}
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