import React from 'react';
import {PlayerStats} from "../OOP/classes/PlayerStats";
// @ts-ignore
import styles from "./PlayerStatsTable.module.css"

interface PlayerStatsTableProps {
    stats: PlayerStats | null;
}

const PlayerStatsTable = ({stats}: PlayerStatsTableProps) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>GP</th>
                    <th>G</th>
                    <th>A</th>
                    <th>P</th>
                    <th>S</th>
                    <th>S%</th>
                </tr>
                </thead>
                <tbody>
                {stats && (
                    <tr>
                        <td>{stats.gamesPlayed}</td>
                        <td>{stats.goals}</td>
                        <td>{stats.assists}</td>
                        <td>{stats.points}</td>
                        <td>{stats.shots}</td>
                        <td>{stats.shootingPercentage.toFixed(1)}%</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerStatsTable;