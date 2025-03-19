import React, { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ChampionshipService } from '../OOP/services/ChampionshipService';
import { TeamService } from '../OOP/services/TeamService';
import { Championship } from "../OOP/classes/Championship";
import { Team } from "../OOP/classes/Team";
// @ts-ignore
import styles from './TeamCRUDPage.module.css';
import { storage } from "../firebaseConfig";
import { ref, deleteObject } from "firebase/storage";

type LoaderData = {
    championships: Championship[];
    teams: Team[];
};

const TeamCrudPage = () => {
    const loaderData = useLoaderData() as LoaderData;
    const [championships, setChampionships] = useState<Championship[]>(loaderData?.championships ?? []);
    const [teams, setTeams] = useState(loaderData?.teams ?? []);
    const [selectedChampionship, setSelectedChampionship] = useState<string>("");
    const navigate = useNavigate();

    const createNavigateHandler = () => {
        navigate("create", { state: { championships } });
    };

    const viewNavigateHandler = (team: Team) => {
        navigate(`${team.id}`, { state: { team } });
    };

    const deleteHandler = async (team: Team) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this team?");
        if (isConfirmed) {
            try {
                await TeamService.deleteTeam(team.id);
                if (team.logo) {
                    try {
                        const storageRef = ref(storage, team.logo);
                        await deleteObject(storageRef);
                    } catch (storageError) {
                        console.error("Error deleting team logo:", storageError);
                        alert("Team deleted but logo cleanup failed");
                    }
                }
                alert("Team deleted successfully");
                setTeams(teams.filter(t => t.id !== team.id));
            } catch (error) {
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

    useEffect(() => {
        if (teams.length === 0 || championships.length === 0) {
            ChampionshipService.getAllChampionships().then(setChampionships);
            TeamService.getAllTeams().then(setTeams);
        }
    }, []);

    return (
        <div className={styles.pageContainer}>
            <button className={styles.createButton} onClick={createNavigateHandler}>
                Create New Team
            </button>

            <div className={styles.filterContainer}>
                <label className={styles.filterLabel} htmlFor="championship-select">
                    Filter by Championship
                </label>
                <select
                    id="championship-select"
                    className={styles.filterSelect}
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

            <div className={styles.teamList}>
                {filteredTeams.map((team) => (
                    <div key={team.id} className={styles.teamItem}>
                        <div className={styles.teamHeader}>
                            <div className={styles.teamName}>{team.name}</div>
                        </div>
                        <div className={styles.championshipList}>
                            {team.championships?.map((ch) => ch.name).join(", ") || "No championships"}
                        </div>
                        <div className={styles.buttonGroup}>
                            <button className={styles.viewButton} onClick={() => viewNavigateHandler(team)}>
                                View Details
                            </button>
                            <button className={styles.deleteButton} onClick={() => deleteHandler(team)}>
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
    return { championships, teams };
};