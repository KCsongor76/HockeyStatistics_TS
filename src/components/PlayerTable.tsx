import React from 'react';
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';
import { IPlayer } from '../OOP/interfaces/IPlayer';

interface PlayerTableProps {
    positionGroups: Array<{
        title: string;
        players: (IPlayer & { goals: number; shots: number; turnovers: number })[];
    }>;
    selectedPlayer: string | null;
    setSelectedPlayer: (id: string | null) => void;
    TableHeader: () => JSX.Element;
}

const PlayerTable = ({
                         positionGroups,
                         selectedPlayer,
                         setSelectedPlayer,
                         TableHeader
                     }: PlayerTableProps) => (
    <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Player Statistics</h3>
        {positionGroups.map((group) => (
            group.players.length > 0 && (
                <div key={group.title}>
                    <h4 className={styles.filterTitle}>{group.title}</h4>
                    <div className={styles.tableContainer}>
                        <table className={styles.statsTable}>
                            <TableHeader />
                            <tbody>
                            {group.players.map((player) => (
                                <tr
                                    key={player.id}
                                    className={`${styles.playerRow} ${
                                        selectedPlayer === player.id ? styles.selectedRow : ''
                                    }`}
                                    onClick={() => {
                                        if (selectedPlayer === player.id) {
                                            setSelectedPlayer(null);
                                        } else {
                                            setSelectedPlayer(player.id);
                                        }
                                    }}
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
                    </div>
                </div>
            )
        ))}
    </div>
);

export default PlayerTable;