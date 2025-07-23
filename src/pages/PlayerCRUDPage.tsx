import React, {useEffect, useState} from 'react';
import {useLoaderData, useNavigate} from "react-router-dom";
import {PlayerService} from "../OOP/services/PlayerService";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './PlayerCRUDPage.module.css';
import {Position} from "../OOP/enums/Position";
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";

// todo: if the (filtered) player list is empty, show: "No players."
// todo: jersey number filter: make sure only 1-99 can be written-selected

const PlayerCRUDPage = () => {
    const navigate = useNavigate();
    const loaderData = useLoaderData() as { players: Player[], teams: Team[] } | undefined;
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [filters, setFilters] = useState({
        team: '',
        position: '',
        jerseyNr: '',
        search: ''
    });
    const [pagination, setPagination] = useState({page: 1, perPage: 10});

    const filteredPlayers = players.filter(player =>
        (!filters.team || player.teamId === filters.team) &&
        (!filters.position || player.position === filters.position) &&
        (!filters.jerseyNr || player.jerseyNumber.toString().includes(filters.jerseyNr)) &&
        (!filters.search || player.name.toLowerCase().includes(filters.search.toLowerCase()))
    );

    const paginatedPlayers = filteredPlayers.slice(
        (pagination.page - 1) * pagination.perPage,
        pagination.page * pagination.perPage
    );

    const deleteHandler = async (player: Player) => {
        if (window.confirm(`Delete ${player.name}?`)) {
            await PlayerService.deletePlayer(player.teamId, player.id);
            // Update local state to remove deleted player
            setPlayers(prev => prev.filter(p => p.id !== player.id));
        }
    };

    useEffect(() => {
        if (loaderData) {
            setPlayers(loaderData.players);
            setTeams(loaderData.teams);
        }
    }, [loaderData]);

    return (
        <div>
            <button onClick={() => navigate("create")}>Create New Player</button>

            <div>
                <input
                    placeholder="Search name..."
                    value={filters.search}
                    onChange={e => setFilters(f => ({...f, search: e.target.value}))}
                />

                <select
                    value={filters.team}
                    onChange={e => setFilters(f => ({...f, team: e.target.value}))}
                >
                    <option value="">All Teams</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>

                <select
                    value={filters.position}
                    onChange={e => setFilters(f => ({...f, position: e.target.value}))}
                >
                    <option key={0} value="">All Positions</option>
                    {Object.values(Position).map((pos, index) => (
                        <option key={index + 1} value={pos}>{pos}</option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Jersey #"
                    value={filters.jerseyNr}
                    onChange={e => setFilters(f => ({...f, jerseyNr: e.target.value}))}
                />

            </div>

            <div>
                {paginatedPlayers.map(player => {
                    const playerTeam = teams.find(t => t.id === player.teamId);

                    return <div key={player.id}>
                        <div>
                            <div>{player.name}</div>
                            <div>#{player.jerseyNumber}</div>
                        </div>

                        <div>
                            <div>Position: {player.position}</div>
                            <div>Team: {playerTeam?.name || 'Unknown'}</div>
                        </div>

                        <div>
                            <button onClick={() => navigate(`${player.id}`, {state: {player}})}>
                                View
                            </button>
                            <button onClick={() => deleteHandler(player)}>
                                Delete
                            </button>
                        </div>

                    </div>
                })}
            </div>

            <div>
                <button
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({...p, page: p.page - 1}))}
                >
                    Previous
                </button>

                <span>Page {pagination.page}</span>

                <button
                    disabled={pagination.page * pagination.perPage >= filteredPlayers.length}
                    onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PlayerCRUDPage;

export const loader = async () => {
    try {
        const [players, teams] = await Promise.all([
            PlayerService.getAllPlayers(),
            TeamService.getAllTeams()
        ]);

        return {players, teams};
    } catch (error) {
        console.error("Error in loader:", error);
        return {players: [], teams: []};
    }
};