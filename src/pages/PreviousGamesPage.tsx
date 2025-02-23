import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
// @ts-ignore
import styles from './PreviousGamesPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";
import {GameService} from "../OOP/services/GameService";

const PreviousGamesPage = () => {
    const [games, setGames] = useState<IGame[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await GameService.getAllGames();
                setGames(gamesData);
            } catch (error) {
                console.error("Error fetching games:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (games.length === 0) {
        return <div className={styles.container}>No games found.</div>;
    }

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
                    {games.map((game: IGame, index: number) => (
                        <tr className={styles.tr} key={game.id || index}>
                            <td className={styles.td}>
                                <img className={styles.teamLogo} src={game.teams.home.logo} alt={game.teams.home.name}/>
                            </td>
                            <td className={styles.td}>{game.teams.home.name}</td>
                            <td className={styles.td}>{game.timestamp}</td>
                            <td className={`${styles.td} ${styles.scoreCell}`}>
                                {game.score.home.goals} - {game.score.away.goals}
                            </td>
                            <td className={styles.td}>{game.teams.away.name}</td>
                            <td className={styles.td}>
                                <img className={styles.teamLogo} src={game.teams.away.logo} alt={game.teams.away.name}/>
                            </td>
                            <td className={styles.td}>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => navigate(`${game.id}`, {state: game})}
                                >
                                    View
                                </button>
                            </td>
                            <td className={styles.td}>
                                <button className={styles.deleteButton} onClick={async () => {
                                    try {
                                        await GameService.deleteGame(game)
                                        alert("Game deleted successfully.")
                                        setGames(games.filter((g: IGame) => g.id !== game.id))
                                    } catch (e) {
                                        console.log(e)
                                        alert("Failed to delete the game. Please try again.")
                                    }
                                }}>Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PreviousGamesPage;