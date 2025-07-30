import React from 'react';
import {PlayerStats} from "../OOP/classes/PlayerStats";

interface PlayerStatsTableProps {
    stats: PlayerStats | null;
}

const PlayerStatsTable = ({stats}: PlayerStatsTableProps) => {
    return (
        <table>
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
    );
};

export default PlayerStatsTable;