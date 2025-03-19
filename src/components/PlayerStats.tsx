import React from 'react';
import {IPlayer} from "../OOP/interfaces/IPlayer";
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';

interface IPlayerWithStats extends IPlayer {
    goals: number;
    shots: number;
    turnovers: number;
}

interface PlayerStatsProps {
    selectedPlayer: string | null;
    setSelectedPlayer: (id: string | null) => void;
    sortBy: keyof IPlayer;
    sortOrder: 'asc' | 'desc';
    handleSort: (column: keyof IPlayer) => void;
    sortedPlayers: IPlayerWithStats[];
    uniqueNonRoster: IPlayer[];
}


const PlayerStats: React.FC<PlayerStatsProps> = ({
    selectedPlayer,
    setSelectedPlayer,
    sortBy,
    sortOrder,
    handleSort,
    sortedPlayers,
    uniqueNonRoster
}) => {
    return (
        <div className={styles.filterGroup}>
            {selectedPlayer && (
                <button
                    className={styles.filterButton}
                    onClick={() => setSelectedPlayer(null)}
                >
                    Clear Player Filter
                </button>
            )}
            <h3 className={styles.filterTitle}>Player Statistics</h3>
            <table className={styles.statsTable}>
                <thead>
                    <tr>
                        {['name', 'jerseyNumber', 'position', 'goals', 'shots', 'turnovers'].map((col) => (
                            <th
                                key={col}
                                onClick={() => handleSort(col as keyof IPlayer)}
                            >
                                {col === 'jerseyNumber' ? 'Number' :
                                    col === 'name' ? 'Name' :
                                        col[0].toUpperCase() + col.slice(1)}
                                {sortBy === col && (
                                    <span className={styles.sortIndicator}>
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedPlayers.map((player) => (
                        <tr
                            key={player.id}
                            className={`${styles.playerRow} ${selectedPlayer === player.id ? styles.selectedRow : ''}`}
                            onClick={() => setSelectedPlayer(player.id)}
                        >
                            <td>{player.name}</td>
                            <td>{player.jerseyNumber}</td>
                            <td>{player.position}</td>
                            <td>{player.goals}</td>
                            <td>{player.shots}</td>
                            <td>{player.turnovers}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {uniqueNonRoster.length > 0 && (
                <>
                    <h4 className={styles.nonRosterTitle}>Non-Roster Players</h4>
                    <ul className={styles.nonRosterList}>
                        {uniqueNonRoster.map(player => (
                            <li className={styles.nonRosterItem} key={player.id}>
                                {player.name} (#{player.jerseyNumber})
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default PlayerStats; 