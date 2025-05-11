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
import {ITeam} from "../OOP/interfaces/ITeam";
import {ActionType} from "../OOP/enums/ActionType";
import {GameType} from "../OOP/enums/GameType";  // Import the CSS module

// todo: button colors

interface PlayerStats {
    gamesPlayed: number;
    goals: number;
    assists: number;
    points: number;
    shots: number;
    shootingPercentage: number;
}

const HandlePlayerPage = () => {
    const {id: playerId} = useParams<{ id: string }>();
    // console.log(playerId);
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

    const calculateStats = (games: IGame[]): PlayerStats => {
        let stats: PlayerStats = {
            gamesPlayed: games.length,
            goals: 0,
            assists: 0,
            points: 0,
            shots: 0,
            shootingPercentage: 0,
        };

        games.forEach(game => {
            game.actions.forEach(action => {
                if (action.player.id === player?.id) {
                    switch (action.type) {
                        case ActionType.GOAL:
                            stats.goals++;
                            stats.shots++;
                            break;
                        case ActionType.ASSIST:
                            stats.assists++;
                            break;
                        case ActionType.SHOT:
                            stats.shots++;
                            break;
                    }
                }
            });
        });

        stats.points = stats.goals + stats.assists;
        stats.shootingPercentage = stats.shots > 0
            ? (stats.goals / stats.shots) * 100
            : 0;

        return stats;
    };

    const playerGames = games.filter(game => {
        if (!player?.id) return false;

        return (
            game.teams.home.roster?.some(p => p.id === player.id) ||
            game.teams.away.roster?.some(p => p.id === player.id)
        );
    });

    const regularGames = playerGames.filter(game => game.type === GameType.REGULAR);
    const playoffGames = playerGames.filter(game => game.type === GameType.PLAYOFF);

    const regularStats = calculateStats(regularGames);
    const playoffStats = calculateStats(playoffGames);

    const PlayerStatsTable: React.FC<{ stats: PlayerStats }> = ({stats}) => (
        <div className={styles.tableContainer}>
            <table>
                <thead>
                <tr>
                    <th>GP</th>
                    <th>G</th>
                    <th>A</th>
                    <th>P</th>
                    <th>S</th>
                    <th>S%</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{stats.gamesPlayed}</td>
                    <td>{stats.goals}</td>
                    <td>{stats.assists}</td>
                    <td>{stats.points}</td>
                    <td>{stats.shots}</td>
                    <td>{stats.shootingPercentage.toFixed(1)}%</td>
                </tr>
                </tbody>
            </table>
        </div>
    );

    useEffect(() => {
        const fetchPlayerAndTeamAndGames = async () => {
            try {
                const playerData = await PlayerService.getPlayerById(playerId as string) as IPlayer;
                setPlayer(playerData);
                console.log("playerData", playerData);

                if (playerData && playerData.teamId) {
                    const teamData = await TeamService.getTeamById(playerData.teamId) as ITeam;
                    setTeam(teamData);
                    console.log("teamData", teamData);
                }

                // Fetch all games
                const gamesData = await GameService.getAllGames();
                setGames(gamesData);
                console.log("gamesData", gamesData);
            } catch (err) {
                console.error(err)
                setError('Failed to fetch player, team, or games data.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerAndTeamAndGames();
    }, [playerId]);

    // console.log(games)


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

            <div className={styles.statsSection}>
                <h3 className={styles.subHeader}>Regular Season Stats</h3>
                <PlayerStatsTable stats={regularStats}/>

                <h3 className={styles.subHeader} style={{marginTop: '2rem'}}>Playoff Stats</h3>
                <PlayerStatsTable stats={playoffStats}/>
            </div>

            <PreviousGamesPage
                playerGames={playerGames}
                showFilters={false}
            />
        </div>
    );
};

export default HandlePlayerPage;
