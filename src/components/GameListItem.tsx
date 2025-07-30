import React from 'react';
import {useNavigate} from "react-router-dom";
// @ts-ignore
import styles from './GameListItem.module.css';
import {Game} from "../OOP/classes/Game";
import {Season} from "../OOP/enums/Season";

interface GameListItemProps {
    game: Game;
}

const GameListItem: React.FC<GameListItemProps> = ({game}) => {
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
        <li className={styles.card} onClick={() => navigate(`/previous_games/${game.id}`, {state: game})}>
            <div className={styles.header}>
                <div className={styles.team}>
                    <img
                        src={game.homeTeam.logo}
                        alt={game.homeTeam.name}
                        className={styles.teamLogo}
                    />
                    <span className={styles.teamName}>{game.homeTeam.name}</span>
                </div>

                <div className={styles.score}>
                    {game.homeScore} - {game.awayScore}
                </div>

                <div className={styles.team}>
                    <img
                        src={game.awayTeam.logo}
                        alt={game.awayTeam.name}
                        className={styles.teamLogo}
                    />
                    <span className={styles.teamName}>{game.awayTeam.name}</span>
                </div>
            </div>

            <div className={styles.date}>
                {formatTime(game.timestamp)}
            </div>

            <div className={styles.details}>
                <span className={styles.detailItem}>Type: {game.type}</span>
                <span className={styles.detailItem}>Season: {game.season || "Not specified"}</span>
                <span className={styles.detailItem}>Championship: {game.championship.name}</span>
            </div>
        </li>
    );
};

export default GameListItem;