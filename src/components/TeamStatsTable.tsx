import React from 'react';
import {TeamStats} from "../OOP/classes/TeamStats";

interface TeamStatsTableProps {
    stats: TeamStats | null;
}

const TeamStatsTable = ({stats}: TeamStatsTableProps) => {
    return (
        <table>
            <thead>
            <tr>
                <th>GP</th>
                <th>W</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>Shots</th>
                <th>TO</th>
                <th>S%</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>{stats?.gamesPlayed || 0 || 0}</td>
                <td>{stats?.wins || 0}</td>
                <td>{stats?.losses || 0}</td>
                <td>{stats?.goalsFor || 0}</td>
                <td>{stats?.goalsAgainst || 0}</td>
                <td>{stats?.shots || 0}</td>
                <td>{stats?.turnovers || 0}</td>
                <td>{stats?.shootingPercentage.toFixed(1) || 0}%</td>
            </tr>
            </tbody>
        </table>
    );
};

export default TeamStatsTable;