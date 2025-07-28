import React, {useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import PreviousGamesPage from "./PreviousGamesPage";
// @ts-ignore
import styles from './HandleTeamPage.module.css';
import {PlayerStats} from "../OOP/classes/PlayerStats";
import {TeamStats} from "../OOP/classes/TeamStats";
import {Team} from "../OOP/classes/Team";
import {IGame} from "../OOP/interfaces/IGame";
import {GameService} from "../OOP/services/GameService";
import {TeamService} from "../OOP/services/TeamService";
import {GameType} from "../OOP/enums/GameType";
import {Player} from "../OOP/classes/Player";
import PreviousGamesPage2 from "./PreviousGamesPage2";
import {Game} from "../OOP/classes/Game";
import {Season} from "../OOP/enums/Season";

const HandleTeamPage = () => {
    const location = useLocation();
    const initialTeam = Team.fromPlain(location.state.team); // Convert to Team instance
    const [team, setTeam] = useState<Team>(initialTeam);
    const [name, setName] = useState(initialTeam.name);
    const [logo, setLogo] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [games, setGames] = useState<IGame[]>([]);
    const [showPlayers, setShowPlayers] = useState(false);
    const [showGames, setShowGames] = useState(false);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof PlayerStats | 'name' | 'jerseyNumber';
        direction: 'asc' | 'desc';
    } | null>(null);
    const seasons = Object.values(Season);
    const [selectedSeason, setSelectedSeason] = useState<Season | 'All'>('All');
    const [selectedChampionship, setSelectedChampionship] = useState<string | 'All'>('All');

    const navigate = useNavigate();

    // Get unique championships from team data and games
    const availableChampionships = useMemo(() => {
        const championshipsFromTeam = team.championships || [];
        const championshipsFromGames = games.map(game => game.championship);

        // Combine and deduplicate championships
        const allChampionships = [...championshipsFromTeam, ...championshipsFromGames];
        const uniqueChampionships = allChampionships.filter((championship, index, array) =>
            array.findIndex(c => c.id === championship.id) === index
        );

        return uniqueChampionships;
    }, [team.championships, games]);

    // Extract current logo filename from URL for comparison
    const getCurrentLogoFileName = (): string | null => {
        if (!team.logo) return null;
        try {
            // Extract filename from Firebase Storage URL
            const url = new URL(team.logo);
            const pathParts = url.pathname.split('/');
            const encodedFileName = pathParts[pathParts.length - 1];
            // Decode the filename (Firebase Storage encodes special characters)
            return decodeURIComponent(encodedFileName.split('?')[0]);
        } catch (error) {
            console.error('Error parsing logo URL:', error);
            return null;
        }
    };

    // Filter games by season and championship
    const filterGames = (type?: GameType) => {
        let result = games.filter(game => {
            // Check if team participated in this game
            const teamParticipated = game.teams.home.id === team.id || game.teams.away.id === team.id;
            if (!teamParticipated) return false;

            // Filter by season
            if (selectedSeason !== 'All' && game.season !== selectedSeason) return false;

            // Filter by championship
            if (selectedChampionship !== 'All' && game.championship.id !== selectedChampionship) return false;

            return true;
        });

        if (type) {
            result = result.filter(game => game.type === type);
        }

        return result;
    };

    const teamGames = filterGames();
    const regularSeasonGames = filterGames(GameType.REGULAR);
    const playoffGames = filterGames(GameType.PLAYOFF);

    // Calculate stats using TeamStats class
    const regularStats = new TeamStats(team.id, regularSeasonGames);
    const playoffStats = new TeamStats(team.id, playoffGames);

    // Filter players based on games they participated in for the selected filters
    const filteredPlayers = useMemo(() => {
        if (!team.players) return [];

        // Get all filtered games (both regular and playoff)
        const allFilteredGames = filterGames();

        // Only return players who participated in at least one game matching the filters
        return team.players.filter(player => {
            return allFilteredGames.some(game =>
                game.teams.home.roster?.some(p => p.id === player.id) ||
                game.teams.away.roster?.some(p => p.id === player.id)
            );
        });
    }, [team.players, games, selectedSeason, selectedChampionship]);

    const sortedPlayers = useMemo(() => {
        const playersCopy = [...filteredPlayers];
        if (!sortConfig) return playersCopy;

        return playersCopy.sort((a, b) => {
            // Direct player properties
            if (sortConfig.key === 'name' || sortConfig.key === 'jerseyNumber') {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                return sortConfig.direction === 'asc'
                    ? (aValue as number) - (bValue as number)
                    : (bValue as number) - (aValue as number);
            }

            // Stats properties - use filtered games for stats calculation
            const getStats = (player: Player) => {
                const playerGames = filterGames().filter(game =>
                    game.teams.home.roster?.some(p => p.id === player.id) ||
                    game.teams.away.roster?.some(p => p.id === player.id)
                );
                return new PlayerStats(player.id, playerGames);
            };

            const statsA = getStats(a);
            const statsB = getStats(b);

            const valueA = statsA[sortConfig.key];
            const valueB = statsB[sortConfig.key];

            if (valueA < valueB) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredPlayers, games, sortConfig, selectedSeason, selectedChampionship]);

    const handleSort = (key: keyof PlayerStats | "name" | "jerseyNumber") => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const goBackHandler = () => navigate("/handleTeams");

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only .jpg and .png formats are allowed.');
                const fileInput = document.getElementById("logo") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
                return;
            }

            // Check file size (10MB in bytes)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert('File size should not exceed 10MB.');
                const fileInput = document.getElementById("logo") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
                return;
            }

            // Check if the new file has the same name as the current logo
            const currentLogoFileName = getCurrentLogoFileName();
            console.log(currentLogoFileName);
            console.log("team-logos/" + file.name);
            if (currentLogoFileName && ("team-logos/" + file.name) === currentLogoFileName) {
                alert('Please choose a different file name. The selected file has the same name as the current logo.');
                const fileInput = document.getElementById("logo") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
                return;
            }

            // If valid, set the logo
            setLogo(file);
        }
    };

    const handleSave = async () => {
        if (!team) return;

        if (name === initialTeam.name && !logo) {
            setIsEditing(false);
            return;
        }

        try {
            const updatedTeam = await team.update(name, logo);
            setTeam(updatedTeam);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating team:", error);
            alert("Something went wrong");
        }
    };

    const handleEdit = () => setIsEditing(true);

    const handleDiscard = () => {
        setTeam(initialTeam);
        setName(initialTeam.name);
        setLogo(null);
        setIsEditing(false);

        // Clear the file input
        const fileInput = document.getElementById("logo") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await GameService.getAllGames();
                setGames(gamesData);
            } catch (error) {
                console.error("Error fetching games:", error);
            }
        };
        fetchGames();
    }, []);

    useEffect(() => {
        const fetchTeam = async () => {
            if (!team.id) return;
            try {
                const teamData = await TeamService.getTeamById(team.id);
                console.log(teamData);
                if (teamData) {
                    const teamObj = Team.fromPlain(teamData);
                    setTeam(teamObj);
                    setName(teamObj.name);
                }
            } catch (error) {
                console.error("Error fetching team:", error);
            }
        };

        fetchTeam();
    }, [team.id, navigate]);

    if (!team) return <div>Loading...</div>;

    return (
        <div>
            <div>
                <p>{team.name}</p>
                <img src={team.logo} alt={team.name}/>
            </div>

            {isEditing ? (
                <>
                    <div>
                        <label htmlFor="name">Team name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="logo">Upload new logo:</label>
                        <input
                            accept="image/jpeg,image/png"
                            type="file"
                            id="logo"
                            onChange={handleLogoChange}
                        />
                    </div>

                    <div>
                        <button onClick={handleSave}>Save Changes</button>
                        <button onClick={handleDiscard}>Discard Changes</button>
                    </div>
                </>
            ) : (
                <div>
                    <button onClick={handleEdit}>Edit Team</button>
                </div>
            )}

            {/* Filters Section */}
            <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
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

                {/* Championship Filter */}
                <div>
                    <label>Championship: </label>
                    <select
                        value={selectedChampionship}
                        onChange={e => setSelectedChampionship(e.target.value)}
                    >
                        <option value="All">All Championships</option>
                        {availableChampionships.map(championship => (
                            <option key={championship.id} value={championship.id}>
                                {championship.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <div onClick={() => setShowPlayers(!showPlayers)}>
                    <h3>Players {filteredPlayers.length > 0 && `(${filteredPlayers.length})`}</h3>
                    <span>{showPlayers ? '▲' : '▼'}</span>
                </div>
                {showPlayers && (
                    <>
                        {filteredPlayers.length > 0 ? (
                            <div>
                                <h3>Regular Season Stats</h3>
                                <table>
                                    <thead>
                                    <tr>
                                        <th onClick={() => handleSort('name')}>Name</th>
                                        <th onClick={() => handleSort('jerseyNumber')}>#</th>
                                        <th>Position</th>
                                        <th onClick={() => handleSort('gamesPlayed')}>GP</th>
                                        <th onClick={() => handleSort('goals')}>G</th>
                                        <th onClick={() => handleSort('assists')}>A</th>
                                        <th onClick={() => handleSort('points')}>P</th>
                                        <th onClick={() => handleSort('shots')}>S</th>
                                        <th onClick={() => handleSort('shootingPercentage')}>S%</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedPlayers.map((player) => {
                                        const playerGames = filterGames().filter(game =>
                                            game.teams.home.roster?.some(p => p.id === player.id) ||
                                            game.teams.away.roster?.some(p => p.id === player.id)
                                        );

                                        const regularGames = playerGames.filter(game => game.type === GameType.REGULAR);
                                        const regularStats = player ? new PlayerStats(player.id, regularGames as unknown as IGame[]) : null;

                                        return (
                                            <tr key={player.id}>
                                                <td>{player.name}</td>
                                                <td>{player.jerseyNumber}</td>
                                                <td>{player.position}</td>
                                                <td>{regularStats?.gamesPlayed || 0}</td>
                                                <td>{regularStats?.goals || 0}</td>
                                                <td>{regularStats?.assists || 0}</td>
                                                <td>{regularStats?.points || 0}</td>
                                                <td>{regularStats?.shots || 0}</td>
                                                <td>{(regularStats?.shootingPercentage || 0).toFixed(1)}%</td>
                                                <td>
                                                    <button
                                                        onClick={() => navigate(`../../handlePlayers/${player.id}`, {state: {player}})}>
                                                        View Player
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>

                                <h3>Playoff Stats</h3>
                                <table>
                                    <thead>
                                    <tr>
                                        <th onClick={() => handleSort('name')}>Name</th>
                                        <th onClick={() => handleSort('jerseyNumber')}>#</th>
                                        <th>Position</th>
                                        <th onClick={() => handleSort('gamesPlayed')}>GP</th>
                                        <th onClick={() => handleSort('goals')}>G</th>
                                        <th onClick={() => handleSort('assists')}>A</th>
                                        <th onClick={() => handleSort('points')}>P</th>
                                        <th onClick={() => handleSort('shots')}>S</th>
                                        <th onClick={() => handleSort('shootingPercentage')}>S%</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedPlayers.map((player) => {
                                        const playerGames = filterGames().filter(game =>
                                            game.teams.home.roster?.some(p => p.id === player.id) ||
                                            game.teams.away.roster?.some(p => p.id === player.id)
                                        );

                                        const playoffGames = playerGames.filter(game => game.type === GameType.PLAYOFF);
                                        const playoffStats = player ? new PlayerStats(player.id, playoffGames as unknown as IGame[]) : null;

                                        return (
                                            <tr key={player.id}>
                                                <td>{player.name}</td>
                                                <td>{player.jerseyNumber}</td>
                                                <td>{player.position}</td>
                                                <td>{playoffStats?.gamesPlayed || 0}</td>
                                                <td>{playoffStats?.goals || 0}</td>
                                                <td>{playoffStats?.assists || 0}</td>
                                                <td>{playoffStats?.points || 0}</td>
                                                <td>{playoffStats?.shots || 0}</td>
                                                <td>{(playoffStats?.shootingPercentage || 0).toFixed(1)}%</td>
                                                <td>
                                                    <button
                                                        onClick={() => navigate(`../../handlePlayers/${player.id}`, {state: {player}})}>
                                                        View Player
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No players found for the selected filters</p>
                        )}
                    </>
                )}
            </div>

            <div>
                <h3>Regular Season Stats</h3>
                <div>
                    <table>
                        <thead>
                        <tr>
                            <th>GP</th>
                            <th>W</th>
                            <th>L</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>Shots</th>
                            <th>TO</th>
                            <th>S%</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{regularStats.gamesPlayed}</td>
                            <td>{regularStats.wins}</td>
                            <td>{regularStats.losses}</td>
                            <td>{regularStats.goalsFor}</td>
                            <td>{regularStats.goalsAgainst}</td>
                            <td>{regularStats.shots}</td>
                            <td>{regularStats.turnovers}</td>
                            <td>{regularStats.shootingPercentage.toFixed(1)}%</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <h3 style={{marginTop: '2rem'}}>Playoff Stats</h3>
                <div>
                    <table>
                        <thead>
                        <tr>
                            <th>GP</th>
                            <th>W</th>
                            <th>L</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>Shots</th>
                            <th>TO</th>
                            <th>S%</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{playoffStats.gamesPlayed}</td>
                            <td>{playoffStats.wins}</td>
                            <td>{playoffStats.losses}</td>
                            <td>{playoffStats.goalsFor}</td>
                            <td>{playoffStats.goalsAgainst}</td>
                            <td>{playoffStats.shots}</td>
                            <td>{playoffStats.turnovers}</td>
                            <td>{playoffStats.shootingPercentage.toFixed(1)}%</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <div onClick={() => setShowGames(!showGames)}>
                    <h3>Team Games {teamGames.length > 0 && `(${teamGames.length})`}</h3>
                    <span>{showGames ? '▲' : '▼'}</span>
                </div>
                {showGames && (
                    <PreviousGamesPage2
                        key={teamGames.map(g => g.id).join('-')}
                        playerGames={teamGames.map(g => Game.fromPlain(g))}
                        showFilters={false}
                    />
                )}
            </div>

            <div>
                <button onClick={goBackHandler}>Go Back</button>
            </div>
        </div>
    );
};

export default HandleTeamPage;