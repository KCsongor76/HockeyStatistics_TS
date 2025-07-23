import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {PlayerService} from '../OOP/services/PlayerService';
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './HandlePlayerPage.module.css';
import {GameService} from "../OOP/services/GameService";
import PreviousGamesPage from "./PreviousGamesPage";
import {GameType} from "../OOP/enums/GameType";
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";
import {Game} from "../OOP/classes/Game";
import {PlayerStats} from "../OOP/classes/PlayerStats";
import {IGame} from "../OOP/interfaces/IGame";

// todo: add player editing: "Edit" button, dropdown (can be edited: position, jersey number, name)
//  similar to HandleTeamPage
const HandlePlayerPage = () => {
    const {id: playerId} = useParams<{ id: string }>();
    const [player, setPlayer] = useState<Player | null>(null);
    const [team, setTeam] = useState<Team>({} as Team);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showGames, setShowGames] = useState(false);

    const navigate = useNavigate();

    const transferNavigate = () => {
        navigate(`../transfer/:${playerId}`, {state: {player}});
    }

    const goBackNavigate = () => {
        navigate(-1);
    }

    const playerGames = games.filter(game => {
        if (!player?.id) return false;

        // @ts-ignore
        return (
            game.teams.home.roster?.some((p: { id: string; }) => p.id === player.id) ||
            game.teams.away.roster?.some((p: { id: string; }) => p.id === player.id)
        );
    });

    const regularGames = playerGames.filter(game => game.type === GameType.REGULAR);
    const playoffGames = playerGames.filter(game => game.type === GameType.PLAYOFF);

    console.log(regularGames);
    console.log(playoffGames);

    const regularStats = player ? new PlayerStats(player.id, regularGames as unknown as IGame[]) : null;
    const playoffStats = player ? new PlayerStats(player.id, playoffGames as unknown as IGame[]) : null;

    useEffect(() => {
        const fetchPlayerAndTeamAndGames = async () => {
            try {
                const playerData = await PlayerService.getPlayerById(playerId as string) as unknown as Player;
                setPlayer(playerData);

                if (playerData && playerData.teamId) {
                    const teamData = await TeamService.getTeamById(playerData.teamId) as unknown as Team;
                    setTeam(teamData);
                }

                const gamesData = await GameService.getAllGames();
                setGames(gamesData as unknown as Game[]);
            } catch (err) {
                console.error(err)
                setError('Failed to fetch player, team, or games data.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerAndTeamAndGames();
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
        <div>
            <h2>{player.name}</h2>
            <p>Team: {team.name}</p>
            <p>Position: {player.position}</p>
            <p>Jersey number: #{player.jerseyNumber}</p>

            <div>
                <h3>Regular Season Stats</h3>
                <div>
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
                        {regularStats && (
                            <tr>
                                <td>{regularStats.gamesPlayed}</td>
                                <td>{regularStats.goals}</td>
                                <td>{regularStats.assists}</td>
                                <td>{regularStats.points}</td>
                                <td>{regularStats.shots}</td>
                                <td>{regularStats.shootingPercentage.toFixed(1)}%</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <h3 style={{marginTop: '2rem'}}>Playoff Stats</h3>
                <div>
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
                        {playoffStats && (
                            <tr>
                                <td>{playoffStats.gamesPlayed}</td>
                                <td>{playoffStats.goals}</td>
                                <td>{playoffStats.assists}</td>
                                <td>{playoffStats.points}</td>
                                <td>{playoffStats.shots}</td>
                                <td>{playoffStats.shootingPercentage.toFixed(1)}%</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <h3>Games Played In:</h3>

            <div>
                <div onClick={() => setShowGames(!showGames)}>
                    <h3>Player Games</h3>
                    <span>{showGames ? '▲' : '▼'}</span>
                </div>
                {showGames && (
                    <PreviousGamesPage
                        playerGames={playerGames as unknown as IGame[]}
                        showFilters={false}
                    />
                )}
            </div>
            <button onClick={transferNavigate}>Transfer</button>
            <button onClick={goBackNavigate}>Go Back</button>

        </div>
    );
};

export default HandlePlayerPage;
