import React from 'react';
import {useNavigate} from "react-router-dom";

// @ts-ignore
import styles from './PreviousGamesPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";

const PreviousGamesPage = () => {
    const raw = localStorage.getItem("gameData")
    const games: IGame[] = JSON.parse(raw || '[]');

    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Previous Games</h1>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th className={styles.th}>Home Team Logo</th>
                        <th className={styles.th}>Home Team</th>
                        <th className={styles.th}>Time</th>
                        <th className={styles.th}>Score</th>
                        <th className={styles.th}>Away Team</th>
                        <th className={styles.th}>Away Team Logo</th>
                        <th className={styles.th}>View</th>
                        <th className={styles.th}>Delete</th>
                    </tr>
                    </thead>

                    <tbody>
                    {games.map((game: IGame, index: number) =>
                        <tr className={styles.tr} key={index}>
                            <td className={styles.td}><img className={styles.teamLogo} src={game.teams.home.logo}
                                                           alt={game.teams.home.name}/></td>
                            <td className={styles.td}>{game.teams.home.name}</td>
                            <td className={styles.td}>{game.timestamp}</td>
                            <td className={`${styles.td} ${styles.scoreCell}`}>{game.score.home.goals} - {game.score.away.goals}</td>
                            <td className={styles.td}>{game.teams.away.name}</td>
                            <td className={styles.td}><img className={styles.teamLogo} src={game.teams.away.logo}
                                                           alt={game.teams.away.name}/></td>
                            <td className={styles.td}>
                                <button className={styles.viewButton} onClick={() => {
                                    navigate(`${index}`, {state: game});
                                }}>View
                                </button>
                            </td>
                            <td className={styles.td}>
                                <button className={styles.deleteButton}>Delete</button>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PreviousGamesPage;