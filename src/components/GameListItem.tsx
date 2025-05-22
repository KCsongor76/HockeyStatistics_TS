import React from 'react';
import {useNavigate} from "react-router-dom";
// @ts-ignore
import styles from '../pages/PreviousGamesPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";

interface GameListItemProps {
    game: IGame;
    index: number;
}

const GameListItem: React.FC<GameListItemProps> = ({game, index}) => {
    const navigate = useNavigate();

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <li
            className={styles.listItem}
            key={game.id || index}
            onClick={() => navigate(`/previous_games/${game.id}`, {state: game})}
        >
            <div className={styles.gameContent}>
                <div className={styles.teamSection}>
                    <img className={styles.teamLogo}
                         src={game.teams?.home.logo}
                         alt={game.teams?.home.name}/>
                    <span>{game.teams?.home.name}</span>
                </div>

                <div className={styles.scoreSection}>
                    {game.score?.home.goals} - {game.score?.away.goals}
                </div>

                <div className={styles.teamSection}>
                    <img className={styles.teamLogo}
                         src={game.teams?.away.logo}
                         alt={game.teams?.away.name}/>
                    <span>{game.teams?.away.name}</span>
                </div>

                <div className={styles.dateSection}>
                    {formatTime(game.timestamp)}
                </div>

                <p className={styles.dateSection}>{game.type}</p>
            </div>
        </li>
    );
};

export default GameListItem;