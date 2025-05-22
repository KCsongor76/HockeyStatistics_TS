import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './TransferPlayerPage.module.css';
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {ITeam} from "../OOP/interfaces/ITeam";
import TransferForm from "../components/forms/TransferForm"; // Import the CSS module

const TransferPlayerPage = () => {
    const player = useLocation().state.player as IPlayer;

    const [teams, setTeams] = useState<ITeam[]>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [transferToTeam, setTransferToTeam] = useState<ITeam>({} as ITeam);

    const navigate = useNavigate();

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!transferToTeam || transferToTeam.name == "" || !transferToTeam.id) {
            alert("Please select a team to transfer to.");
            return;
        }

        const isConfirmed = window.confirm(`Are you sure you want to transfer player "${player.name}" to team "${transferToTeam.name}"?`);

        if (!isConfirmed) {
            alert("Player transfer canceled.");
            return;
        }

        try {
            if (isConfirmed) {
                const fromTeam = teams.find(team => team.id === player.teamId) as ITeam;
                await TeamService.transferPlayer(fromTeam, transferToTeam, player);
                alert("Player transferred successfully.");
                navigate('/handlePlayers');
            }
        } catch (error) {
            alert("Failed to transfer the player. Please try again.");
            console.error('Failed to transfer player:', error);
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
            <TransferForm
                styles={styles}
                onSubmitHandler={submitHandler}
                selectedTeamId={transferToTeam?.id}
                onTeamChange={(teamId) =>
                    setTransferToTeam(teams.find(team => team.id === teamId) || {} as ITeam)
                }
                teams={teams}
                player={player}
                onGoBack={() => navigate(-1)}
            />
        </div>
    );
};

export default TransferPlayerPage;
