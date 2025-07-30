import React from 'react';
import {useNavigate} from "react-router-dom";
// @ts-ignore
import styles from '../pages/PreviousGamesPage.module.css';
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
        <li
            key={game.id}
            onClick={() => navigate(`/previous_games/${game.id}`, {state: game})}
        >
            <div>
                <div>
                    <img
                        src={game.homeTeam.logo}
                        alt={game.homeTeam.name}
                    />
                    <span>{game.homeTeam.name}</span>
                </div>

                <div>
                    {game.homeScore} - {game.awayScore}
                </div>

                <div>
                    <img
                        src={game.awayTeam.logo}
                        alt={game.awayTeam.name}
                    />
                    <span>{game.awayTeam.name}</span>
                </div>

                <div>
                    {formatTime(game.timestamp)}
                </div>

                <p>Type: {game.type}</p>
                <p>Season: {game.season || "Not specified"}</p>
                <p>Championship: {game.championship.name}</p>
            </div>
        </li>
    );
};

export default GameListItem;