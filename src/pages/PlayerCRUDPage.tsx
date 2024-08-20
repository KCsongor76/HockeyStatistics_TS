import React, {useState} from 'react';
import {useLoaderData, useNavigate} from "react-router-dom";
import {PlayerService} from "../OOP/services/PlayerService";
import {Player} from "../OOP/classes/Player";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './PlayerCRUDPage.module.css';

const PlayerCRUDPage = () => {
    const loaderData = useLoaderData() as { player: Player, teamName: string }[] ?? [];
    const navigate = useNavigate();

    const [playersWithTeamNames, setPlayersWithTeamNames] = useState(loaderData);

    const deleteHandler = async (player: Player) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this player?");

        if (isConfirmed) {
            try {
                await PlayerService.deletePlayer(player.teamId, player.id);
                alert("Player deleted successfully.");
                setPlayersWithTeamNames((prevPlayers) => prevPlayers.filter((p) => p.player.id !== player.id));
            } catch (error) {
                alert("Failed to delete the player. Please try again.");
            }
        } else {
            alert("Player deletion canceled.");
        }
    }

    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>#</th>
                    <th>Position</th>
                    <th>Team</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {playersWithTeamNames.length > 0 && playersWithTeamNames.map(({player, teamName}) => (
                    <tr key={player.id}>
                        <td>{player.name}</td>
                        <td>{player.jerseyNumber}</td>
                        <td>{player.position}</td>
                        <td>{teamName}</td>
                        <td>
                            <div className={styles.actions}>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => navigate(`${player.id}`, {state: {player}})}
                                >
                                    View
                                </button>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => deleteHandler(player)}
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button className={styles.createButton} onClick={() => navigate("create")}>Create Player</button>
            <button className={styles.backButton} onClick={() => navigate("/")}>Go Back</button>
        </div>
    );
};

export default PlayerCRUDPage;

export const loader = async (): Promise<{ player: Player, teamName: string }[]> => {
    const players = await PlayerService.getAllPlayers();
    return await Promise.all(
        players.map(async (player) => {
            const team = await TeamService.getTeamById(player.teamId);
            return {
                player,
                teamName: team ? team.name : "Unknown Team",
            };
        })
    );
}