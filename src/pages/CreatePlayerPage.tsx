import React, {useState} from 'react';
import {Position} from "../OOP/enums/Position";
import {TeamService} from "../OOP/services/TeamService";
import {Team} from "../OOP/classes/Team";
import {useLoaderData, useNavigate} from "react-router-dom";
import {PlayerService} from "../OOP/services/PlayerService";
import {Player} from "../OOP/classes/Player";
// @ts-ignore
import styles from './CreatePlayerPage.module.css';

const CreatePlayerPage = () => {
    const loaderData = useLoaderData() as Team[];
    const teams = loaderData ?? [];

    // State management for form inputs
    const [name, setName] = useState('');
    const [position, setPosition] = useState(Position.GOALIE);
    const [jerseyNumber, setJerseyNumber] = useState(1);
    const [teamId, setTeamId] = useState(teams.length > 0 ? teams[0].id : '');

    const navigate = useNavigate();

    const goBackHandler = () => {
        navigate("/handlePlayers");
    };

    const submitHandler = async (event: React.FormEvent) => {
        event.preventDefault();

        // Creating the player object
        const newPlayer = new Player("0", name, position, jerseyNumber, teamId);

        console.log('New player:', newPlayer);

        // Submit the new player (e.g., sending the newPlayer object to an API)
        try {
            await PlayerService.addPlayerToTeam(newPlayer.teamId, newPlayer);
            alert('Player created successfully!');
            setName("");
            setPosition(Position.GOALIE);
            setJerseyNumber(1);
            setTeamId(teams.length > 0 ? teams[0].id : '');
        } catch (error) {
            console.error('Error creating player:', error);
            alert('Failed to create player. Please try again.');
        }
    };

    return (
        <form className={styles.formContainer} onSubmit={submitHandler}>
            <div className={styles.formGroup}>
                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Position:</label>
                <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as Position)}
                    required
                >
                    <option value={Position.GOALIE}>{Position.GOALIE}</option>
                    <option value={Position.DEFENDER}>{Position.DEFENDER}</option>
                    <option value={Position.FORWARD}>{Position.FORWARD}</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>Jersey Number:</label>
                <input
                    type="number"
                    value={jerseyNumber}
                    min={1}
                    max={99}
                    onChange={(e) => setJerseyNumber(parseInt(e.target.value))}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Team:</label>
                <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    required
                >
                    {teams.length > 0 && teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
            </div>

            <button className={styles.submitButton} type="submit">Create</button>
            <button className={styles.backButton} type="button" onClick={goBackHandler}>Go back</button>
        </form>
    );
};

export default CreatePlayerPage;

export const loader = async () => {
    return await TeamService.getAllTeams();
};
