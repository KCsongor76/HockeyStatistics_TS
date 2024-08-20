import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Player} from '../OOP/classes/Player';
import {PlayerService} from '../OOP/services/PlayerService';
import {Team} from "../OOP/classes/Team";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './HandlePlayerPage.module.css';  // Import the CSS module

const HandlePlayerPage = () => {
    const {id: playerId} = useParams<{ id: string }>();
    const [player, setPlayer] = useState<Player | null>(null);
    const [team, setTeam] = useState<Team>(new Team());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const transferNavigate = () => {
        navigate(`../transfer/:${playerId}`, {state: {player}});
    }

    const goBackNavigate = () => {
        navigate("/handlePlayers");
    }

    useEffect(() => {
        const fetchPlayerAndTeam = async () => {
            try {
                const playerData = await PlayerService.getPlayerById(playerId as string) as Player;
                setPlayer(playerData);

                if (playerData && playerData.teamId) {
                    const teamData = await TeamService.getTeamById(playerData.teamId) as Team;
                    setTeam(teamData);
                }
            } catch (err) {
                setError('Failed to fetch player or team data.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerAndTeam();
    }, [playerId]);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!player) {
        return <div className={styles.error}>Player not found</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>{player.name}</h2>
            <p className={styles.teamName}>Team: {team.name}</p>
            <p className={styles.position}>Position: {player.position}</p>
            <p className={styles.jerseyNumber}>Jersey number: #{player.jerseyNumber}</p>
            <button className={styles.button} onClick={transferNavigate}>Transfer</button>
            <button className={styles.button} onClick={goBackNavigate}>Go Back</button>
        </div>
    );
};

export default HandlePlayerPage;
