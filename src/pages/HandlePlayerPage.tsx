import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {PlayerService} from '../OOP/services/PlayerService';
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './HandlePlayerPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";
import {GameService} from "../OOP/services/GameService";
import PreviousGamesPage from "./PreviousGamesPage";
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {ITeam} from "../OOP/interfaces/ITeam";  // Import the CSS module

// todo: add data, games when he played
// todo: button colors

const HandlePlayerPage = () => {
    const {id: playerId} = useParams<{ id: string }>();
    const [player, setPlayer] = useState<IPlayer | null>(null);
    const [team, setTeam] = useState<ITeam>({} as ITeam);
    const [games, setGames] = useState<IGame[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const transferNavigate = () => {
        navigate(`../transfer/:${playerId}`, {state: {player}});
    }

    const goBackNavigate = () => {
        // navigate("/handlePlayers");
        navigate(-1);
    }

    useEffect(() => {
        const fetchPlayerAndTeamAndGames = async () => {
            try {
                const playerData = await PlayerService.getPlayerById(playerId as string) as IPlayer;
                setPlayer(playerData);

                if (playerData && playerData.teamId) {
                    const teamData = await TeamService.getTeamById(playerData.teamId) as ITeam;
                    setTeam(teamData);
                }

                // Fetch all games
                const gamesData = await GameService.getAllGames();
                setGames(gamesData);
            } catch (err) {
                setError('Failed to fetch player, team, or games data.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerAndTeamAndGames();
    }, [playerId]);

    console.log(games)

    const playerGames = games.filter(game => {
        if (!player?.id) return false;

        return (
            game.teams.home.roster?.some(p => p.id === player.id) ||
            game.teams.away.roster?.some(p => p.id === player.id)
        );
    });

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
            <h3 className={styles.subHeader}>Games Played In:</h3>
            <PreviousGamesPage
                playerGames={playerGames}
                showFilters={false}
            />
        </div>
    );
};

export default HandlePlayerPage;
