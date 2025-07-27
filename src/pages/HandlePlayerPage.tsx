import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import PreviousGamesPage2 from "./PreviousGamesPage2";
import PreviousGamesPage from "./PreviousGamesPage";
// @ts-ignore
import styles from './HandlePlayerPage.module.css';
import {PlayerService} from '../OOP/services/PlayerService';
import {TeamService} from "../OOP/services/TeamService";
import {GameService} from "../OOP/services/GameService";
import {PlayerStats} from "../OOP/classes/PlayerStats";
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";
import {Game} from "../OOP/classes/Game";
import {IGame} from "../OOP/interfaces/IGame";
import {Position} from "../OOP/enums/Position";
import {Season} from "../OOP/enums/Season";
import {GameType} from "../OOP/enums/GameType";

const HandlePlayerPage = () => {
    const {id: playerId} = useParams<{ id: string }>();
    const [player, setPlayer] = useState<Player | null>(null);
    const [team, setTeam] = useState<Team>({} as Team);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showGames, setShowGames] = useState(false);
    const [name, setName] = useState("");
    const [position, setPosition] = useState<Position>(Position.DEFENDER);
    const [jerseyNumber, setJerseyNumber] = useState<number>(1);
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const seasons = Object.values(Season);
    const [selectedSeason, setSelectedSeason] = useState<Season | 'All'>('All');
    const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('All');
    const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
    // Add championship filter state
    const [selectedChampionshipFilter, setSelectedChampionshipFilter] = useState<string>('All');
    const [availableChampionships, setAvailableChampionships] = useState<{id: string, name: string}[]>([]);

    const navigate = useNavigate();

    const transferNavigate = () => {
        navigate(`../transfer/:${playerId}`, {state: {player}});
    }

    const goBackNavigate = () => {
        navigate(-1);
    }

    const playerGames = useMemo(() => {
        if (!player?.id) return [];

        return games.filter(game =>
            game.teams.home.roster?.some(p => p.id === player.id) ||
            game.teams.away.roster?.some(p => p.id === player.id)
        );
    }, [games, player?.id]);

    const filteredGames = useMemo(() => {
        let result = [...playerGames];

        if (selectedSeason !== 'All') {
            result = result.filter(game => game.season === selectedSeason);
        }

        if (selectedTeamFilter !== 'All') {
            result = result.filter(game =>
                game.teams.home.id === selectedTeamFilter ||
                game.teams.away.id === selectedTeamFilter
            );
        }

        // Add championship filter
        if (selectedChampionshipFilter !== 'All') {
            result = result.filter(game => game.championship.id === selectedChampionshipFilter);
        }

        return result;
    }, [playerGames, selectedSeason, selectedTeamFilter, selectedChampionshipFilter]);

    // Get teams player played for in selected season
    useEffect(() => {
        if (selectedSeason === 'All') {
            setAvailableTeams([]);
            setSelectedTeamFilter('All');
            return;
        }

        const teamsInSeason = playerGames
            .filter(game => game.season === selectedSeason)
            .flatMap(game => [game.teams.home, game.teams.away])
            .filter(team => team.roster?.some(p => p.id === player?.id));

        const uniqueTeams = Array.from(
            new Map(teamsInSeason.map(team => [team.id, team])).values()
        );

        setAvailableTeams(uniqueTeams);
        setSelectedTeamFilter(uniqueTeams.length > 0 ? 'All' : '');
    }, [selectedSeason, playerGames, player?.id]);

    // Get available championships
    useEffect(() => {
        const championships = playerGames
            .map(game => ({id: game.championship.id, name: game.championship.name}))
            .filter((champ, index, self) =>
                self.findIndex(c => c.id === champ.id) === index
            );

        setAvailableChampionships(championships);
    }, [playerGames]);

    const regularGames = filteredGames.filter(game => game.type === GameType.REGULAR);
    const playoffGames = filteredGames.filter(game => game.type === GameType.PLAYOFF);

    const regularStats = player ? new PlayerStats(player.id, regularGames as unknown as IGame[]) : null;
    const playoffStats = player ? new PlayerStats(player.id, playoffGames as unknown as IGame[]) : null;

    const renderTeamFilter = () => {
        if (selectedSeason === 'All' || availableTeams.length <= 1) return null;

        return (
            <div>
                <label>Team: </label>
                <select
                    value={selectedTeamFilter}
                    onChange={e => setSelectedTeamFilter(e.target.value)}
                >
                    <option value="All">All Teams</option>
                    {availableTeams.map(team => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    // Add championship filter UI
    const renderChampionshipFilter = () => {
        if (availableChampionships.length <= 1) return null;

        return (
            <div>
                <label>Championship: </label>
                <select
                    value={selectedChampionshipFilter}
                    onChange={e => setSelectedChampionshipFilter(e.target.value)}
                >
                    <option value="All">All Championships</option>
                    {availableChampionships.map(championship => (
                        <option key={championship.id} value={championship.id}>
                            {championship.name}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    const handleSave = async () => {
        if (!player) return;
        setUpdating(true);

        try {
            await PlayerService.updatePlayer(
                player.teamId,
                player.id,
                { name, position, jerseyNumber }
            );

            const updatedPlayer = new Player(name, position, jerseyNumber, team.id, player.id);
            setPlayer(updatedPlayer);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update player:", error);
            setError('Failed to update player. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (player) {
            setName(player.name);
            setPosition(player.position);
            setJerseyNumber(player.jerseyNumber);
        }
    }, [player]);

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

            {isEditing ? (
                <>
                    <div>
                        <label htmlFor="name">Player name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                        />
                    </div>

                    <div>
                        <label htmlFor="position">Position:</label>
                        <select
                            id="position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value as Position)}
                        >
                            {Object.values(Position).map((pos) => (
                                <option key={pos} value={pos}>
                                    {pos}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="jerseyNumber">Jersey number:</label>
                        <input
                            type="number"
                            id="jerseyNumber"
                            min="1"
                            value={jerseyNumber}
                            onChange={(e) => setJerseyNumber(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <button onClick={handleSave} disabled={!name.trim()}>
                            Save Changes
                        </button>
                        <button onClick={() => setIsEditing(false)}>
                            Discard Changes
                        </button>
                    </div>
                </>
            ) : (
                <button onClick={() => setIsEditing(true)}>Edit Player</button>
            )}

            {/* Season Filter */}
            <div>
                <label>Season: </label>
                <select
                    value={selectedSeason}
                    onChange={e => setSelectedSeason(e.target.value as Season | 'All')}
                >
                    <option value="All">All Seasons</option>
                    {seasons.map(season => (
                        <option key={season} value={season}>{season}</option>
                    ))}
                </select>
            </div>

            {/* Team Filter */}
            {renderTeamFilter()}

            {/* Championship Filter */}
            {renderChampionshipFilter()}

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
                {/* Game count indicator */}
                <p>{filteredGames.length} of {playerGames.length} games available by filter</p>
                {showGames && (
                    <PreviousGamesPage2
                        key={filteredGames.map(g => g.id).join('-')}
                        playerGames={filteredGames}
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