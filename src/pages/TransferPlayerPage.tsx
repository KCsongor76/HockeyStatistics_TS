import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './TransferPlayerPage.module.css';
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";
import {Position} from "../OOP/enums/Position";

const TransferPlayerPage = () => {

    const playerInterface = useLocation().state.player as IPlayer;
    const player = new Player(playerInterface.name, playerInterface.position as Position, playerInterface.jerseyNumber, playerInterface.teamId, playerInterface.id);
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState("");

    console.log(selectedTeamId);

    useEffect(() => {
        TeamService.getAllTeams().then(teamsData => {
            // Convert ITeam objects to Team instances
            const teamInstances = teamsData.map(team => Team.fromPlain(team));
            setTeams(teamInstances);
        });
    }, []);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeamId) return alert("Select a team");

        const newTeam = teams.find(t => t.id === selectedTeamId)!;
        const confirm = window.confirm(`Transfer ${player.name} to ${newTeam.name}?`);

        if (confirm) {
            await player.transferToTeam(newTeam);
            alert("Transfer successful.");
            navigate('/handlePlayers');
        }
    };

    return (
        <div>
            <h2>Transfer Player</h2>
            <p>Player: {player.name}</p>
            <p>Current Team: {teams.find(t => t.id === player.teamId)?.name}</p>

            <form onSubmit={submitHandler}>
                <label>Transfer to:</label>
                <select
                    value={selectedTeamId}
                    onChange={e => setSelectedTeamId(e.target.value)}
                    required
                >
                    <option key={""} value={""} disabled>Select a Team</option>
                    {teams.filter(t => t.id !== player.teamId).map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>

                <button type="submit">Transfer</button>
                <button type="button" onClick={() => navigate(-1)}>Cancel</button>
            </form>
        </div>
    );
};

export default TransferPlayerPage;