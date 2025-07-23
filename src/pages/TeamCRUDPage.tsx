import React, {useState, useEffect} from 'react';
import {useLoaderData, useNavigate} from 'react-router-dom';
import {ChampionshipService} from '../OOP/services/ChampionshipService';
import {TeamService} from '../OOP/services/TeamService';
// @ts-ignore
import styles from './TeamCRUDPage.module.css';
import {IChampionship} from "../OOP/interfaces/IChampionship";
import {ITeam} from "../OOP/interfaces/ITeam";

const TeamCrudPage = () => {
    const loaderData = useLoaderData() as { championships: IChampionship[], teams: ITeam[] } | undefined;
    const navigate = useNavigate();
    const [teams, setTeams] = useState<ITeam[]>([]);
    const [championships, setChampionships] = useState<IChampionship[]>([]);
    const [selectedChampionship, setSelectedChampionship] = useState<string>("");

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
        navigate("create", { state: { championships } });
    };

    const viewNavigateHandler = (team: ITeam) => {
        navigate(`${team.id}`, { state: { team } });
    };

    // todo: team.delete()?
    const deleteHandler = async (team: ITeam) => {
        const isConfirmed = window.confirm(`Are you sure you want to delete ${team.name}?`);
        if (isConfirmed) {
            try {
                await TeamService.deleteTeam(team.id);
                if (team.logo) {
                    try {
                        await TeamService.deleteLogo(team.logo);
                    } catch (storageError) {
                        console.error("Error deleting team logo:", storageError);
                        alert("Team deleted but logo cleanup failed");
                    }
                }
                setTeams(teams.filter(t => t.id !== team.id));
                alert("Team deleted successfully");
            } catch (error) {
                console.error("Error deleting team:", error);
                alert("Failed to delete the team. Please try again.");
            }
        }
    };

    const handleChampionshipChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChampionship(event.target.value);
    };

    const filteredTeams = selectedChampionship
        ? teams.filter(team => team.championships?.some(ch => ch.id === selectedChampionship))
        : teams;

    return (
        <div>
            <button onClick={createNavigateHandler}>
                Create New Team
            </button>

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
                {filteredTeams.map((team) => (
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
                ))}
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