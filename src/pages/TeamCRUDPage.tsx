import React, {useEffect, useState} from 'react';
import {useLoaderData, useNavigate} from 'react-router-dom';
import {ChampionshipService} from '../OOP/services/ChampionshipService';
import {TeamService} from '../OOP/services/TeamService';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";

type LoaderData = {
    championships: Championship[];
    teams: Team[];
};

const TeamCrudPage = () => {
    const loaderData = useLoaderData() as LoaderData;

    // Initialize state with the data from the loader
    const [championships, setChampionships] = useState<Championship[]>(loaderData?.championships ?? []);
    const [teams, setTeams] = useState(loaderData?.teams ?? []);
    const [selectedChampionship, setSelectedChampionship] = useState<string>("");

    const navigate = useNavigate();

    const createNavigateHandler = () => {
        navigate("create", {state: {championships}});
    };

    const viewNavigateHandler = (team: Team) => {
        navigate(`${team.name}`, {state: {team}});
    };

    const deleteHandler = async (team: Team) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this team?");

        if (isConfirmed) {
            try {
                await TeamService.deleteTeam(team.id);
                alert("Team deleted successfully");

                // Update the teams state to remove the deleted team
                setTeams(teams.filter(t => t.id !== team.id));
            } catch (error) {
                alert("Failed to delete the team. Please try again.");
            }
        } else {
            alert("Team deletion canceled.");
        }
    };


    // Handle the selection of a championship
    const handleChampionshipChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChampionship(event.target.value);
    };

    // Filter teams based on the selected championship
    const filteredTeams = selectedChampionship
        ? teams.filter(team => team.championships && team.championships.some(ch => ch.id === selectedChampionship))
        : teams;

    useEffect(() => {
        if (teams.length === 0 || championships.length === 0) {
            ChampionshipService.getAllChampionships().then(championships => setChampionships(championships));
            TeamService.getAllTeams().then(teams => setTeams(teams));
        }
    }, [])

    return (
        <>
            <button onClick={createNavigateHandler}>Create Team</button>

            <div>
                <label htmlFor="championship-select">Filter by Championship: </label>
                <select
                    id="championship-select"
                    value={selectedChampionship}
                    onChange={handleChampionshipChange}
                >
                    <option value="">All Championships</option>
                    {championships.map((championship: Championship) => (
                        <option key={championship.id} value={championship.id}>
                            {championship.name}
                        </option>
                    ))}
                </select>
            </div>

            <table>
                <thead>
                <tr>
                    <th>Team Name</th>
                    <th>View</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                {filteredTeams.map((team: Team) => (
                    <tr key={team.id}>
                        <td>{team.name}</td>
                        <td>
                            <button onClick={() => viewNavigateHandler(team)}>View</button>
                        </td>
                        <td>
                            <button onClick={() => deleteHandler(team)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    );
};

export default TeamCrudPage;

export const loader = async () => {
    const championships = await ChampionshipService.getAllChampionships();
    const teams = await TeamService.getAllTeams();
    return {championships, teams};
};
