import React, {useEffect, useState} from 'react';
import {useLoaderData, useNavigate} from 'react-router-dom';
// @ts-ignore
import styles from './TeamCRUDPage.module.css';
import {IChampionship} from "../OOP/interfaces/IChampionship";
import {ITeam} from "../OOP/interfaces/ITeam";
import {IGame} from "../OOP/interfaces/IGame";
import {Season} from "../OOP/enums/Season";
import {ChampionshipService} from '../OOP/services/ChampionshipService';
import {PlayerService} from "../OOP/services/PlayerService";
import {TeamService} from '../OOP/services/TeamService';
import {GameService} from "../OOP/services/GameService";

const TeamCrudPage = () => {
    const loaderData = useLoaderData() as {
        championships: IChampionship[],
        teams: ITeam[],
        games: IGame[]
    } | undefined;

    const [teams, setTeams] = useState<ITeam[]>([]);
    const [championships, setChampionships] = useState<IChampionship[]>([]);
    const [games, setGames] = useState<IGame[]>([]);
    const seasons = Object.values(Season);

    const [filters, setFilters] = useState({
        search: '',
        season: '',
        championship: ''
    });

    const [pagination, setPagination] = useState({page: 1, perPage: 10});
    const navigate = useNavigate();

    const perPageOptions = [10, 25, 50, 100];

    const filteredTeams = teams.filter(team => {
        // Name filter
        if (filters.search && !team.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }

        // Season filter
        if (filters.season) {
            const seasonTeams = new Set<string>();
            games.forEach(game => {
                if (game.season === filters.season) {
                    seasonTeams.add(game.teams.home.id);
                    seasonTeams.add(game.teams.away.id);
                }
            });
            if (!seasonTeams.has(team.id)) return false;
        }

        // Championship filter
        if (filters.championship) {
            const hasChampionship = team.championships?.some(ch => ch.id === filters.championship) ?? false;
            if (!hasChampionship) return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredTeams.length / pagination.perPage);
    const paginatedTeams = filteredTeams.slice(
        (pagination.page - 1) * pagination.perPage,
        pagination.page * pagination.perPage
    );

    const createNavigateHandler = () => {
        navigate("create", {state: {championships}});
    };

    const viewNavigateHandler = (team: ITeam) => {
        navigate(`${team.id}`, {state: {team}});
    };

    const deleteHandler = async (team: ITeam) => {
        if (window.confirm(`Delete ${team.name}? Players will become free agents.`)) {
            try {
                // Move players to free agent team
                const players = await PlayerService.getPlayersByTeam(team.id);
                const transferPromises = players.map(player =>
                    TeamService.transferPlayer(team.id, "free-agent", player)
                );

                await Promise.all(transferPromises);
                await TeamService.deleteTeam(team.id);
                setTeams(prev => prev.filter(t => t.id !== team.id));
                alert("Team deleted successfully. Players moved to free agents.");
            } catch (error) {
                console.error("Error deleting team:", error);
                alert("Failed to delete team. Please try again.");
            }
        }
    };

    useEffect(() => {
        if (loaderData) {
            setChampionships(loaderData.championships);
            setTeams(loaderData.teams);
            setGames(loaderData.games);
        }
    }, [loaderData]);

    return (
        <div>
            <button onClick={createNavigateHandler}>Create New Team</button>

            <div>
                <label htmlFor={"name-search"}>
                    Filter by name
                </label>

                <input
                    placeholder="Search name..."
                    value={filters.search}
                    onChange={e => setFilters(f => ({...f, search: e.target.value}))}
                />
            </div>

            <div>
                <label htmlFor="season-select">
                    Filter by Season
                </label>
                <select
                    id="season-select"
                    value={filters.season}
                    onChange={e => setFilters(f => ({...f, season: e.target.value}))}
                >
                    <option value="">All Seasons</option>
                    {seasons.map(season => (
                        <option key={season} value={season}>
                            {season}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="championship-select">
                    Filter by Championship
                </label>
                <select
                    id="championship-select"
                    value={filters.championship}
                    onChange={e => setFilters(f => ({...f, championship: e.target.value}))}
                >
                    <option value="">All Championships</option>
                    {championships.map((championship) => (
                        <option key={championship.id} value={championship.id}>
                            {championship.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                {paginatedTeams.length > 0 ? paginatedTeams.map((team) => (
                    <div key={team.id}>
                        <div>
                            <div>{team.name}</div>
                        </div>

                        <div>
                            {team.championships?.map((ch) => ch.name).join(", ") || "No championships"}
                        </div>

                        <div>
                            <button onClick={() => viewNavigateHandler(team)}>View</button>
                            <button onClick={() => deleteHandler(team)}>Delete</button>
                        </div>
                    </div>
                )) : <p>No teams.</p>}
            </div>

            <div>
                <button
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({...p, page: p.page - 1}))}
                >
                    Previous
                </button>

                <span>Page {pagination.page} of {totalPages}</span>

                <button
                    disabled={pagination.page >= totalPages}
                    onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
                >
                    Next
                </button>

                <select
                    value={pagination.perPage}
                    onChange={e => setPagination({
                        page: 1,
                        perPage: parseInt(e.target.value)
                    })}
                >
                    {perPageOptions.map(option => (
                        <option key={option} value={option}>
                            {option} per page
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default TeamCrudPage;

export const loader = async () => {
    const championships = await ChampionshipService.getAllChampionships();
    const teams = await TeamService.getAllTeams();
    const games = await GameService.getAllGames();
    return {championships, teams, games};
};