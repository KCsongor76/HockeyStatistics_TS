import React from 'react';
import {GameType} from "../OOP/enums/GameType";
import {PlayerStats} from "../OOP/classes/PlayerStats";
import {IGame} from "../OOP/interfaces/IGame";
import {Player} from "../OOP/classes/Player";
import {useNavigate} from "react-router-dom";

interface TeamPlayerStatsTableProps {
    sortedPlayers: Player[];
    filterGames: (type?: GameType) => IGame[];
    handleSort: (key: "gamesPlayed" | "goals" | "assists" | "points" | "shots" | "shootingPercentage" | "getRegularSeasonStats" | "getPlayoffStats" | "name" | "jerseyNumber") => void
    isPlayoff: boolean
}

const TeamPlayerStatsTable = ({sortedPlayers, filterGames, handleSort, isPlayoff}: TeamPlayerStatsTableProps) => {
    const navigate = useNavigate();

    return (
        <table>
            <thead>
            <tr>
                <th onClick={() => handleSort('name')}>Name</th>
                <th onClick={() => handleSort('jerseyNumber')}>#</th>
                <th>Position</th>
                <th onClick={() => handleSort('gamesPlayed')}>GP</th>
                <th onClick={() => handleSort('goals')}>G</th>
                <th onClick={() => handleSort('assists')}>A</th>
                <th onClick={() => handleSort('points')}>P</th>
                <th onClick={() => handleSort('shots')}>S</th>
                <th onClick={() => handleSort('shootingPercentage')}>S%</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {sortedPlayers.map((player) => {
                const playerGames = filterGames().filter(game =>
                    game.teams.home.roster?.some(p => p.id === player.id) ||
                    game.teams.away.roster?.some(p => p.id === player.id)
                );

                const gameTypeCheck = isPlayoff ? GameType.PLAYOFF : GameType.REGULAR

                const games = playerGames.filter(game => game.type === gameTypeCheck);
                const stats = player ? new PlayerStats(player.id, games as unknown as IGame[]) : null;

                return (
                    <tr key={player.id}>
                        <td>{player.name}</td>
                        <td>{player.jerseyNumber}</td>
                        <td>{player.position}</td>
                        <td>{stats?.gamesPlayed || 0}</td>
                        <td>{stats?.goals || 0}</td>
                        <td>{stats?.assists || 0}</td>
                        <td>{stats?.points || 0}</td>
                        <td>{stats?.shots || 0}</td>
                        <td>{(stats?.shootingPercentage || 0).toFixed(1)}%</td>
                        <td>
                            <button
                                onClick={() => navigate(`../../handlePlayers/${player.id}`, {state: {player}})}>
                                View Player
                            </button>
                        </td>
                    </tr>
                )
            })}
            </tbody>
        </table>

    );
};

export default TeamPlayerStatsTable;