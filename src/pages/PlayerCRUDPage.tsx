import React, {useEffect, useState} from 'react';
import {useLoaderData, useNavigate} from "react-router-dom";
// @ts-ignore
import styles from './PlayerCRUDPage.module.css';
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";
import {Position} from "../OOP/enums/Position";
import {Season} from "../OOP/enums/Season";
import {PlayerService} from "../OOP/services/PlayerService";
import {TeamService} from "../OOP/services/TeamService";
import {GameService} from "../OOP/services/GameService";
import Pagination from "../components/Pagination";
import {TextInput} from "../components/CRUD/TextInput";
import {Select} from "../components/CRUD/Select";
import {JerseyNumberInput} from "../components/JerseyNumberInput";
import {CustomButton} from "../components/CustomButton";
import PlayerCard from "../components/PlayerCard";

// Define a new type that extends Player with seasons
interface PlayerWithSeasons extends Player {
    seasons: string[];
}

const PlayerCRUDPage = () => {
    const loaderData = useLoaderData() as {
        players: PlayerWithSeasons[],
        teams: Team[],
        seasons: string[]
    } | undefined;

    const [players, setPlayers] = useState<PlayerWithSeasons[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const seasons = Object.values(Season);
    const [filters, setFilters] = useState({
        team: '',
        position: '',
        jerseyNr: '',
        search: '',
        season: ''
    });
    const [pagination, setPagination] = useState({page: 1, perPage: 10});

    const navigate = useNavigate();

    const filteredPlayers = players.filter(player =>
        (!filters.team || player.teamId === filters.team) &&
        (!filters.position || player.position === filters.position) &&
        (!filters.jerseyNr || player.jerseyNumber.toString().includes(filters.jerseyNr)) &&
        (!filters.search || player.name.toLowerCase().includes(filters.search.toLowerCase())) &&
        (!filters.season || player.seasons.includes(filters.season))
    );

    const totalPages = Math.ceil(filteredPlayers.length / pagination.perPage);
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
            <CustomButton type="positive" onClick={() => navigate("create")}>
                Create New Player
            </CustomButton>


            <TextInput
                label={"Search by name"}
                value={filters.search}
                onChange={value => setFilters(f => ({...f, search: value}))}
                placeholder={"Search name..."}
            />

            <Select
                value={filters.team}
                options={teams.map(t => ({value: t.id, label: t.name}))}
                onChange={value => setFilters(f => ({...f, team: value}))}
                label={"Filter by team"}
                allLabel={"All Teams"}
            />

            <Select
                value={filters.position}
                options={Object.values(Position).map(p => ({value: p, label: p}))}
                onChange={value => setFilters(f => ({...f, position: value}))}
                label={"Filter by position"}
                allLabel={"All Positions"}
            />

            <JerseyNumberInput
                label={"Filter by jersey number"}
                value={filters.jerseyNr}
                onChange={value => setFilters(f => ({...f, jerseyNr: value.toString()}))}
                placeholder={"Jersey"}
            />

            <Select
                value={filters.season}
                options={seasons.map(s => ({value: s, label: s}))}
                onChange={value => setFilters(f => ({...f, season: value}))}
                label={"Filter by Season"}
                allLabel={"All Seasons"}
            />

            <div>
                {paginatedPlayers.length > 0 ? paginatedPlayers.map((player: Player) =>
                    <PlayerCard
                        key={player.id}
                        player={player}
                        playerTeam={teams.find(t => t.id === player.teamId)}
                        deleteHandler={deleteHandler}
                    />
                ) : <p>No players.</p>}
            </div>

            <Pagination pagination={pagination} totalPages={totalPages} setPagination={setPagination}/>
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