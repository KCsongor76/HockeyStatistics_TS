import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './TransferPlayerPage.module.css';
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";
import {Position} from "../OOP/enums/Position";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import {PlayerService} from "../OOP/services/PlayerService";
import {Select} from "../components/CRUD/Select";
import {CustomButton} from "../components/CustomButton";

const TransferPlayerPage = () => {

    const [errors, setErrors] = useState<Record<string, string>>({});
    const playerInterface = useLocation().state.player as IPlayer;
    const player = new Player(playerInterface.name, playerInterface.position as Position, playerInterface.jerseyNumber, playerInterface.teamId, playerInterface.id);
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [isFreeAgent, setIsFreeAgent] = useState(false);

    useEffect(() => {
        if (player.teamId === 'free-agent') {
            setIsFreeAgent(true);
        }
        TeamService.getAllTeams().then(teamsData => {
            // Convert ITeam objects to Team instances
            const teamInstances = teamsData.map(team => Team.fromPlain(team));
            setTeams(teamInstances);
        });
    }, []);

    const freeAgentHandler = async () => {
        if (window.confirm(`Set ${player.name} as free agent?`)) {
            try {
                const freeAgentTeam = new Team(
                    "Free Agents",
                    "",
                    {} as ITeamColor,
                    {} as ITeamColor,
                    [],
                    [],
                    [],
                    "free-agent"
                )
                // const freeAgentPlayers = PlayerService.getPlayersByTeam(freeAgentTeam.id)
                await player.transferToTeam(freeAgentTeam);

                alert("Player is now a free agent");
                navigate('/handlePlayers');
            } catch (error) {
                setErrors({general: 'Failed to set as free agent.'});
            }
        }
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeamId) {
            setErrors({team: 'Select a team'});
            return;
        }

        const newTeam = teams.find(t => t.id === selectedTeamId)!;
        try {
            // ... jersey number check ...
            const isAvailable = await Player.isJerseyNumberAvailable(newTeam.id, player.jerseyNumber);
            if (!isAvailable) {
                setErrors({jersey: `Jersey number ${player.jerseyNumber} is taken!`});
                return;
            }
            // ... rest of transfer code ...
            const confirm = window.confirm(`Transfer ${player.name} to ${newTeam.name}?`);

            if (confirm) {
                await player.transferToTeam(newTeam);
                alert("Transfer successful.");
                navigate('/handlePlayers');
            }
        } catch (error) {
            setErrors({general: 'Transfer failed. Please try again.'});
        }

    };

    return (
        <div>
            <h2>Transfer Player</h2>
            <p>Player: {player.name}</p>
            <p>Current Team: {teams.find(t => t.id === player.teamId)?.name}</p>

            <form onSubmit={submitHandler}>
                <Select
                    value={selectedTeamId}
                    options={teams.map((team) => ({value: team.id, label: team.name}))}
                    onChange={setSelectedTeamId}
                    label={"Transfer to:"}
                    allLabel={"Select a team"}
                    allValue={""}
                />

                {/* Team select */}
                {errors.team && <span>{errors.team}</span>}

                {/* Jersey error */}
                {errors.jersey && <span>{errors.jersey}</span>}

                {/* General error */}
                {errors.general && <span>{errors.general}</span>}

                {!isFreeAgent && (
                    <CustomButton type="negative" onClick={freeAgentHandler}>
                        Set to free agent
                    </CustomButton>
                )}
                <CustomButton type="positive" buttonType="submit">
                    Transfer
                </CustomButton>
                <CustomButton type="negative" onClick={() => navigate(-1)}>
                    Cancel
                </CustomButton>
            </form>
        </div>
    );
};

export default TransferPlayerPage;