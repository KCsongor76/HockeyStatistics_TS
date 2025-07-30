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
import {Game} from "../OOP/classes/Game";
import {Season} from "../OOP/enums/Season";
import {Select} from "../components/CRUD/Select";
import {TextInput} from "../components/CRUD/TextInput";
import {FileInput} from "../components/FileInput";
import {CustomButton} from "../components/CustomButton";
import TeamPlayerStatsTable from "../components/TeamPlayerStatsTable";
import TeamStatsTable from "../components/TeamStatsTable";

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
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [sortConfigs, setSortConfigs] = useState<{
        regular: { key: keyof PlayerStats | 'name' | 'jerseyNumber'; direction: 'asc' | 'desc' } | null;
        playoff: { key: keyof PlayerStats | 'name' | 'jerseyNumber'; direction: 'asc' | 'desc' } | null;
    }>({regular: null, playoff: null});

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
        // Get all players who ever played for this team (including transferred/deleted ones)
        const allPlayersInGames = new Map<string, Player>();

        // Process all games to find players who played for this team
        games.forEach(game => {
            if (game.teams.home.id === team.id && game.teams.home.roster) {
                game.teams.home.roster.forEach(player => {
                    if (!allPlayersInGames.has(player.id)) {
                        allPlayersInGames.set(player.id, Player.fromPlain(player));
                    }
                });
            }
            if (game.teams.away.id === team.id && game.teams.away.roster) {
                game.teams.away.roster.forEach(player => {
                    if (!allPlayersInGames.has(player.id)) {
                        allPlayersInGames.set(player.id, Player.fromPlain(player));
                    }
                });
            }
        });

        // Add current team players (to include those who haven't played yet)
        if (team.players) {
            team.players.forEach(player => {
                if (!allPlayersInGames.has(player.id)) {
                    allPlayersInGames.set(player.id, player);
                }
            });
        }

        return Array.from(allPlayersInGames.values());
    }, [team.players, games, team.id]);

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

    const getSortedPlayers = useMemo(() => (isPlayoff: boolean) => {
        const playersCopy = [...filteredPlayers];
        const sortConfig = isPlayoff ? sortConfigs.playoff : sortConfigs.regular;

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
                const playerGames = filterGames().filter(game => {
                    const isHomeTeam = game.teams.home.id === team.id;
                    const roster = isHomeTeam ? game.teams.home.roster : game.teams.away.roster;
                    return roster?.some(p => p.id === player.id);
                });

                // Filter by game type
                const filteredByType = playerGames.filter(game =>
                    isPlayoff ? game.type === GameType.PLAYOFF : game.type === GameType.REGULAR
                );

                return new PlayerStats(player.id, filteredByType);
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
    }, [filteredPlayers, games, sortConfigs, selectedSeason, selectedChampionship, team.id]);

    const handleSort = (key: keyof PlayerStats | "name" | "jerseyNumber", isPlayoff: boolean) => {
        setSortConfigs(prev => {
            const currentConfig = isPlayoff ? prev.playoff : prev.regular;
            let direction: 'asc' | 'desc' = 'asc';

            if (currentConfig && currentConfig.key === key && currentConfig.direction === 'asc') {
                direction = 'desc';
            }

            return isPlayoff
                ? {...prev, playoff: {key, direction}}
                : {...prev, regular: {key, direction}};
        });
    };

    const goBackHandler = () => navigate("/handleTeams");

    const handleNameChange = (value: string) => {
        setName(value);
    };

    const handleLogoChange = (file: File | null) => {
        if (!file) {
            setLogo(null);
            setErrors(prev => ({...prev, logo: ''}));
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setErrors(prev => ({...prev, logo: 'Only .jpg and .png formats are allowed'}));
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setErrors(prev => ({...prev, logo: 'File size should not exceed 10MB'}));
            return;
        }

        const currentLogoFileName = getCurrentLogoFileName();
        if (currentLogoFileName && ("team-logos/" + file.name) === currentLogoFileName) {
            setErrors(prev => ({...prev, logo: 'Please choose a different file name'}));
            return;
        }

        setLogo(file);
        setErrors(prev => ({...prev, logo: ''}));
    };

    const handleSave = async () => {
        if (!team) return;

        if (name === initialTeam.name && !logo) {
            setIsEditing(false);
            return;
        }

        try {
            if (name !== initialTeam.name) {
                const nameTaken = await TeamService.isNameTaken(name, team.id);
                if (nameTaken) {
                    setErrors(prev => ({...prev, name: `Team name "${name}" is already taken`}));
                    return;
                }
            }

            if (logo) {
                const logoExists = await TeamService.checkLogoExists(logo.name, false);
                if (logoExists) {
                    setErrors(prev => ({...prev, logo: `Logo filename "${logo.name}" is already used`}));
                    return;
                }
            }

            const updatedTeam = await team.update(name, logo);
            setTeam(updatedTeam);
            setIsEditing(false);
            setErrors({});
        } catch (error) {
            setErrors(prev => ({...prev, general: 'Failed to update team. Please try again.'}));
            console.error("Error updating team:", error);
        }
    };

    const handleEdit = () => setIsEditing(true);

    const handleDiscard = () => {
        setTeam(initialTeam);
        setName(initialTeam.name);
        setLogo(null);
        setIsEditing(false);
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
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.teamInfo}>
                    {team.logo && <img src={team.logo} alt={team.name} className={styles.teamLogo}/>}
                    <h1 className={styles.teamName}>{team.name}</h1>
                </div>
            </div>

            {isEditing ? (
                <div className={styles.editSection}>
                    <div className={styles.editForm}>
                        <TextInput
                            label="Team name:"
                            value={name}
                            onChange={handleNameChange}
                            error={errors.name}
                        />
                        <FileInput
                            label="Upload new logo:"
                            onChange={handleLogoChange}
                            error={errors.logo}
                        />
                    </div>
                    {errors.general && <span className={styles.generalError}>{errors.general}</span>}
                    <div className={styles.editActions}>
                        <CustomButton type="positive" onClick={handleSave}>
                            Save Changes
                        </CustomButton>
                        <CustomButton type="negative" onClick={handleDiscard}>
                            Discard Changes
                        </CustomButton>
                    </div>
                </div>
            ) : (
                <CustomButton type="neutral" onClick={handleEdit}>
                    Edit Team
                </CustomButton>
            )}

            <div className={styles.filterSection}>
                <Select
                    value={selectedSeason || "All"}
                    options={seasons.map(s => ({value: s, label: s}))}
                    onChange={value => setSelectedSeason(value as Season | 'All')}
                    label={"Season: "}
                    allLabel={"All Seasons"}
                    allValue={"All"}
                />

                <Select
                    value={selectedChampionship}
                    options={availableChampionships.map(c => ({value: c.id, label: c.name}))}
                    onChange={value => setSelectedChampionship(value)}
                    label={"Championship: "}
                    allLabel={"All Championships"}
                    allValue={"All"}
                />
            </div>

            <div className={styles.playersSection}>
                <div className={styles.playersHeader} onClick={() => setShowPlayers(!showPlayers)}>
                    <h3>Players {filteredPlayers.length > 0 && `(${filteredPlayers.length})`}</h3>
                    <span>{showPlayers ? '▲' : '▼'}</span>
                </div>
                {showPlayers && (
                    <div className={styles.playersContent}>
                        {filteredPlayers.length > 0 ? (
                            <>
                                <div className={styles.statsSection}>
                                    <h3>Regular Season Stats</h3>
                                    <div className={styles.tableContainer}>
                                        <TeamPlayerStatsTable
                                            sortedPlayers={getSortedPlayers(false)}
                                            filterGames={filterGames}
                                            handleSort={(key) => handleSort(key, false)}
                                            isPlayoff={false}
                                        />
                                    </div>
                                </div>

                                <div className={styles.statsSection}>
                                    <h3>Playoff Stats</h3>
                                    <div className={styles.tableContainer}>
                                        <TeamPlayerStatsTable
                                            sortedPlayers={getSortedPlayers(true)}
                                            filterGames={filterGames}
                                            handleSort={(key) => handleSort(key, true)}
                                            isPlayoff={true}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p>No players found for the selected filters</p>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.statsSection}>
                <h3>Regular Season Stats</h3>
                <div className={styles.tableContainer}>
                    <TeamStatsTable stats={regularStats}/>
                </div>
            </div>

            <div className={styles.statsSection}>
                <h3>Playoff Stats</h3>
                <div className={styles.tableContainer}>
                    <TeamStatsTable stats={playoffStats}/>
                </div>
            </div>

            <div className={styles.gamesSection}>
                <div className={styles.gamesHeader} onClick={() => setShowGames(!showGames)}>
                    <h3>Team Games {teamGames.length > 0 && `(${teamGames.length})`}</h3>
                    <span>{showGames ? '▲' : '▼'}</span>
                </div>
                {showGames && (
                    <PreviousGamesPage
                        key={teamGames.map(g => g.id).join('-')}
                        playerGames={teamGames.map(g => Game.fromPlain(g))}
                        showFilters={false}
                    />
                )}
            </div>

            <div className={styles.buttonGroup}>
                <CustomButton type="negative" onClick={goBackHandler}>
                    Go Back
                </CustomButton>
            </div>
        </div>
    );
};

export default HandleTeamPage;