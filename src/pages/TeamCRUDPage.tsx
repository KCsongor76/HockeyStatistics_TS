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
import Pagination from "../components/Pagination";
import {TextInput} from "../components/CRUD/TextInput";
import {Select} from "../components/CRUD/Select";
import {CustomButton} from '../components/CustomButton';
import TeamCard from "../components/TeamCard";
import {Team} from "../OOP/classes/Team";

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
            <CustomButton type="positive" onClick={createNavigateHandler}>
                Create New Team
            </CustomButton>

            <TextInput
                label={"Search by name"}
                value={filters.search}
                onChange={value => setFilters(f => ({...f, search: value}))}
                placeholder={"Search by name"}
            />

            <Select
                value={filters.season}
                options={seasons.map(s => ({value: s, label: s}))}
                onChange={value => setFilters(f => ({...f, season: value}))}
                label={"Filter by Season"}
                allLabel={"All Seasons"}
            />

            <Select
                value={filters.championship}
                options={championships.map(c => ({value: c.id, label: c.name}))}
                onChange={value => setFilters(f => ({...f, championship: value}))}
                label={"Filter by Championship"}
                allLabel={"All Championships"}
            />

            <div>
                {paginatedTeams.length > 0 ? paginatedTeams.map((team) => (
                    <TeamCard key={team.id} team={Team.fromPlain(team)} deleteHandler={deleteHandler}/>
                )) : <p>No teams.</p>}
            </div>

            <Pagination pagination={pagination} totalPages={totalPages} setPagination={setPagination}/>
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