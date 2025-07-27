import React, {useEffect, useState} from 'react';
import {useLoaderData, useNavigate} from "react-router-dom";
import {PlayerService} from "../OOP/services/PlayerService";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './PlayerCRUDPage.module.css';
import {Position} from "../OOP/enums/Position";
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";
import {GameService} from "../OOP/services/GameService";
import {Season} from "../OOP/enums/Season";

// Define a new type that extends Player with seasons
interface PlayerWithSeasons extends Player {
    seasons: string[];
}

const PlayerCRUDPage = () => {
    const navigate = useNavigate();
    const loaderData = useLoaderData() as {
        players: PlayerWithSeasons[],
        teams: Team[],
        seasons: string[]
    } | undefined;

    const [players, setPlayers] = useState<PlayerWithSeasons[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const seasons = Object.values(Season);
    const [selectedSeason, setSelectedSeason] = useState<Season | "">("");
    const [filters, setFilters] = useState({
        team: '',
        position: '',
        jerseyNr: '',
        search: '',
        season: ''
    });
    const [pagination, setPagination] = useState({page: 1, perPage: 10});

    const filteredPlayers = players.filter(player =>
        (!filters.team || player.teamId === filters.team) &&
        (!filters.position || player.position === filters.position) &&
        (!filters.jerseyNr || player.jerseyNumber.toString().includes(filters.jerseyNr)) &&
        (!filters.search || player.name.toLowerCase().includes(filters.search.toLowerCase())) &&
        (!selectedSeason || player.seasons.includes(selectedSeason))
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
                    min={1}
                    max={99}
                    onChange={e => setFilters(f => ({...f, jerseyNr: e.target.value}))}
                />

                <label>Season: </label>
                <select
                    value={selectedSeason}
                    onChange={e => setSelectedSeason(e.target.value as Season || "")}
                >
                    <option value="">All Seasons</option>
                    {seasons.map(season => (
                        <option key={season} value={season}>{season}</option>
                    ))}
                </select>

            </div>

            <div>
                {paginatedPlayers.length > 0 ? paginatedPlayers.map(player => {
                    const playerTeam = teams.find(t => t.id === player.teamId);

                    return <div key={player.id}>
                        <div>
                            <div>{player.name}</div>
                            <div>#{player.jerseyNumber}</div>
                        </div>

                        <div>
                            <div>Position: {player.position}</div>
                            <div>Team: {playerTeam?.name || 'Unknown'}</div>
                            {/*<div>Seasons: {player.seasons.join(', ')}</div>*/}
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
                }) : <p>No players.</p>}
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
        const [players, teams, games] = await Promise.all([
            PlayerService.getAllPlayers(),
            TeamService.getAllTeams(),
            GameService.getAllGames()
        ]);

        // Create a player season map
        const playerSeasonMap: Record<string, Set<string>> = {};

        games.forEach(game => {
            const addPlayerSeason = (playerId: string) => {
                if (!playerSeasonMap[playerId]) {
                    playerSeasonMap[playerId] = new Set();
                }
                if (game.season) {
                    playerSeasonMap[playerId].add(game.season);
                }
            };

            // Process home team roster
            game.teams?.home?.roster?.forEach(player => {
                addPlayerSeason(player.id);
            });

            // Process away team roster
            game.teams?.away?.roster?.forEach(player => {
                addPlayerSeason(player.id);
            });
        });

        // Add seasons to players
        const playersWithSeasons = players.map(player => ({
            ...player,
            seasons: Array.from(playerSeasonMap[player.id] || [])
        })) as PlayerWithSeasons[];

        // Get unique seasons
        // @ts-ignore
        const allSeasons = [...new Set(
            Object.values(playerSeasonMap).flatMap(set => Array.from(set))
        )].sort();

        return {
            players: playersWithSeasons,
            teams,
            seasons: allSeasons
        };
    } catch (error) {
        console.error("Error in loader:", error);
        return {
            players: [],
            teams: [],
            seasons: []
        };
    }
};