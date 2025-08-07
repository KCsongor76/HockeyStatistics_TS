import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
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
import {TextInput} from "../components/CRUD/TextInput";
import {Select} from "../components/CRUD/Select";
import {JerseyNumberInput} from "../components/JerseyNumberInput";
import {CustomButton} from "../components/CustomButton";
import PlayerStatsTable from "../components/PlayerStatsTable";

const HandlePlayerPage = () => {
    const {id: playerId} = useParams<{ id: string }>();
    const [player, setPlayer] = useState<Player | null>(null);
    const [team, setTeam] = useState<Team>({} as Team);
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [jerseyError, setJerseyError] = useState<string | null>(null);
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
    const [availableChampionships, setAvailableChampionships] = useState<{ id: string, name: string }[]>([]);

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
            const teams1 = playerGames
                .flatMap(game => [game.teams.home, game.teams.away])
                .filter(team => team.roster?.some(p => p.id === player?.id));

            const teams2 = Array.from(
                new Map(teams1.map(team => [team.id, team])).values()
            );

            setAvailableTeams(teams2);
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

        console.log("playerGames: ", playerGames);
        console.log("teamsInSeason", teamsInSeason);
        console.log("uniqueTeams", uniqueTeams);

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

    const handleSave = async () => {
        if (!player) return;

        // Check if jersey number was changed
        if (jerseyNumber !== player.jerseyNumber) {
            try {
                if (isNaN(jerseyNumber)) {
                    setJerseyError(`Jersey number has to be a number.`);
                    return;
                }

                if (jerseyNumber < 1 || jerseyNumber > 99) {
                    setJerseyError(`Jersey number has to be between 1-99.`);
                    return;
                }

                const isAvailable = await Player.isJerseyNumberAvailable(player.teamId, jerseyNumber);
                if (!isAvailable) {
                    setJerseyError(`Jersey number #${jerseyNumber} is already taken by another player in this team.`);
                    return;
                }
            } catch (error) {
                console.error("Failed to check jersey number availability:", error);
                setError('Failed to verify jersey number availability. Please try again.');
                return;
            }
        }

        setUpdating(true);
        setError(null);

        try {
            await PlayerService.updatePlayer(
                player.teamId,
                player.id,
                {name, position, jerseyNumber}
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
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.playerInfo}>
                    <h2 className={styles.playerName}>{player.name}</h2>
                    <div className={styles.playerDetails}>
                        <p>Team: {team.name}</p>
                        <p>Position: {player.position}</p>
                        <p>Jersey number: #{player.jerseyNumber}</p>
                    </div>
                </div>
            </div>

            {isEditing ? (
                <div className={styles.editSection}>
                    <div className={styles.editForm}>
                        <TextInput
                            label={"Player name:"}
                            value={name}
                            onChange={value => setName(value)}
                        />

                        <Select
                            value={position}
                            options={Object.values(Position).map((p) => ({value: p, label: p}))}
                            onChange={value => setPosition(value as Position)}
                            label={"Position:"}
                            includeAll={false}
                        />

                        <JerseyNumberInput
                            label={"Jersey number:"}
                            value={jerseyNumber}
                            onChange={value => setJerseyNumber(Number(value))}
                        />
                        {jerseyError && <p className={styles.error}>{jerseyError}</p>}
                    </div>

                    <div className={styles.editActions}>
                        <CustomButton
                            type="positive"
                            onClick={handleSave}
                            disabled={!name.trim() || updating}
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </CustomButton>
                        <CustomButton type="negative" onClick={() => setIsEditing(false)}>
                            Discard Changes
                        </CustomButton>
                    </div>
                </div>
            ) : (
                <CustomButton type="neutral" onClick={() => setIsEditing(true)}>
                    Edit Player
                </CustomButton>
            )}

            <div className={styles.filterSection}>
                <Select
                    value={selectedSeason}
                    options={Object.values(Season).map((s) => ({value: s, label: s}))}
                    onChange={value => setSelectedSeason(value as Season | "All")}
                    label={"Season:"}
                    allLabel={"All Seasons"}
                    allValue={"All"}
                />

                {availableTeams.length > 1 && <Select
                    value={selectedTeamFilter}
                    options={availableTeams.map((t) => ({value: t.id, label: t.name}))}
                    onChange={value => setSelectedTeamFilter(value)}
                    label={"Team:"}
                    allLabel={"All Teams"}
                    allValue={"All"}
                />}

                {availableChampionships.length > 1 && <Select
                    value={selectedChampionshipFilter}
                    options={availableChampionships.map((c) => ({value: c.id, label: c.name}))}
                    onChange={value => setSelectedChampionshipFilter(value)}
                    label={"Championship:"}
                    allLabel={"All Championships"}
                    allValue={"All"}
                />}
            </div>

            <div className={styles.statsSection}>
                <h3>Regular Season Stats</h3>
                <div className={styles.tableContainer}>
                    <PlayerStatsTable stats={regularStats}/>
                </div>
            </div>

            <div className={styles.statsSection}>
                <h3>Playoff Stats</h3>
                <div className={styles.tableContainer}>
                    <PlayerStatsTable stats={playoffStats}/>
                </div>
            </div>

            <div className={styles.gamesSection}>
                <div className={styles.gamesHeader} onClick={() => setShowGames(!showGames)}>
                    <h3>Games Played In</h3>
                    <span>{showGames ? '▲' : '▼'}</span>
                </div>
                <p className={styles.gamesCount}>{filteredGames.length} of {playerGames.length} games available by
                    filter</p>
                {showGames && (
                    <PreviousGamesPage
                        key={filteredGames.map(g => g.id).join('-')}
                        playerGames={filteredGames}
                        showFilters={false}
                    />
                )}
            </div>

            <div className={styles.buttonGroup}>
                <CustomButton type="neutral" onClick={transferNavigate}>
                    Transfer
                </CustomButton>
                <CustomButton type="negative" onClick={goBackNavigate}>
                    Go Back
                </CustomButton>
            </div>
        </div>
    );
};

export default HandlePlayerPage;