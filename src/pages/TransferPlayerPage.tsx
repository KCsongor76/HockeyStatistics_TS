import React, {useEffect, useState} from 'react';
import {useLocation} from "react-router-dom";
import {Player} from "../OOP/classes/Player";
import {TeamService} from "../OOP/services/TeamService";
import {Team} from "../OOP/classes/Team";
// @ts-ignore
import styles from './TransferPlayerPage.module.css'; // Import the CSS module

const TransferPlayerPage = () => {
    const player = useLocation().state.player as Player;

    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [transferToTeam, setTransferToTeam] = useState<Team>(new Team());

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isConfirmed = window.confirm(`Are you sure you want to transfer player "${player.name}" to team "${transferToTeam.name}"?`);
        if (isConfirmed) {
            console.log(player)
            console.log(player instanceof Player)
            const fromTeam = teams.find(team => team.id === player.teamId) as Team;
            await TeamService.transferPlayer(fromTeam, transferToTeam, player);
        }
    }

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teamsData = await TeamService.getAllTeams();
                setTeams(teamsData);
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to fetch teams:', error);
            }
        }

        fetchTeams();
    }, []);

    if (!isLoaded) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Transfer Player</h2>
            <p>Player: {player.name}</p>
            <p>From: {teams.find(team => team.id === player.teamId)?.name}</p>
            <form className={styles.form} onSubmit={submitHandler}>
                <label className={styles.label} htmlFor="team">To team:</label>
                <select
                    id="team"
                    className={styles.select}
                    value={transferToTeam.id || ''} // Default to an empty string if no team is selected
                    onChange={(e) => setTransferToTeam(teams.find(team => team.id === e.target.value) ?? new Team())}
                >
                    <option value="" disabled>Select a team</option>
                    {teams.filter(team => team.id !== player.teamId).map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
                <button className={styles.button} type="submit">Transfer</button>
            </form>
        </div>
    );
};

export default TransferPlayerPage;
