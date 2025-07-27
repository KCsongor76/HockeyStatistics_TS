import React, {useState, useEffect, useMemo} from 'react';
import {useLoaderData, useNavigate} from 'react-router-dom';
import {ChampionshipService} from '../OOP/services/ChampionshipService';
import {TeamService} from '../OOP/services/TeamService';
// @ts-ignore
import styles from './TeamCRUDPage.module.css';
import {IChampionship} from "../OOP/interfaces/IChampionship";
import {ITeam} from "../OOP/interfaces/ITeam";
import {PlayerService} from "../OOP/services/PlayerService";
import {Season} from "../OOP/enums/Season";
import {IGame} from "../OOP/interfaces/IGame";
import {GameService} from "../OOP/services/GameService";

const TeamCrudPage = () => {
    const loaderData = useLoaderData() as { championships: IChampionship[], teams: ITeam[] } | undefined;
    const navigate = useNavigate();
    const [teams, setTeams] = useState<ITeam[]>([]);
    const [championships, setChampionships] = useState<IChampionship[]>([]);
    const [selectedChampionship, setSelectedChampionship] = useState<string>("");
    const seasons = Object.values(Season);
    const [selectedSeason, setSelectedSeason] = useState<Season | "">("");
    const [games, setGames] = useState<IGame[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            const gamesData = await GameService.getAllGames();
            setGames(gamesData);
        };
        fetchGames();
    }, []);

    useEffect(() => {
        if (loaderData) {
            setTeams(loaderData.teams);
            setChampionships(loaderData.championships);
        } else {
            // Fallback: Fetch data directly if loaderData is undefined
            const fetchData = async () => {
                const champs = await ChampionshipService.getAllChampionships();
                const teamsData = await TeamService.getAllTeams();
                setChampionships(champs);
                setTeams(teamsData);
            };
            fetchData();
        }
    }, [loaderData]);

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
                setTeams(teams.filter(t => t.id !== team.id));
                alert("Team deleted successfully. Players moved to free agents.");
            } catch (error) {
                console.error("Error deleting team:", error);
                alert("Failed to delete team. Please try again.");
            }
        }
    };

    const handleChampionshipChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChampionship(event.target.value);
    };

    const filteredTeams = useMemo(() => {
        if (!selectedSeason) return teams;

        // Get teams that played in selected season
        const seasonTeams = new Set<string>();
        games.forEach(game => {
            if (game.season === selectedSeason) {
                seasonTeams.add(game.teams.home.id);
                seasonTeams.add(game.teams.away.id);
            }
        });

        return teams.filter(team => seasonTeams.has(team.id));
    }, [teams, games, selectedSeason]);

    return (
        <div>
            <button onClick={createNavigateHandler}>
                Create New Team
            </button>

            <div>
                <label htmlFor="season-select">
                    Filter by Season
                </label>
                <select
                    id="season-select"
                    value={selectedSeason}
                    onChange={e => setSelectedSeason(e.target.value as Season || "")}
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
                    value={selectedChampionship}
                    onChange={handleChampionshipChange}
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
                {filteredTeams.length > 0 ? filteredTeams.map((team) => (
                    <div key={team.id}>
                        <div>
                            <div>{team.name}</div>
                        </div>
                        <div>
                            {team.championships?.map((ch) => ch.name).join(", ") || "No championships"}
                        </div>
                        <div>
                            <button onClick={() => viewNavigateHandler(team)}>
                                View Details
                            </button>
                            <button onClick={() => deleteHandler(team)}>
                                Delete Team
                            </button>
                        </div>
                    </div>
                )) : <p>No teams.</p>}
            </div>
        </div>
    );
};

export default TeamCrudPage;

export const loader = async () => {
    const championships = await ChampionshipService.getAllChampionships();
    const teams = await TeamService.getAllTeams();
    return {championships, teams};
};