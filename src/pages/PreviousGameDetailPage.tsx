import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import Icon from "../components/Icon";
import {ActionType} from "../OOP/enums/ActionType";
import {RegularPeriod, PlayoffPeriod} from "../OOP/enums/Period";
// @ts-ignore
import styles from './PreviousGameDetailPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";
import {IGameAction} from "../OOP/interfaces/IGameAction";
import IconDataModal from "../modals/IconDataModal";
import {GameService} from "../OOP/services/GameService";
import {IPlayer} from "../OOP/interfaces/IPlayer";

const PreviousGameDetailPage = () => {
    const location = useLocation();
    const gameData = location.state as IGame;
    const navigate = useNavigate();

    const fieldImageRef = useRef<HTMLImageElement>(null);
    const [iconSize, setIconSize] = useState(30);


    console.log(gameData);

    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    type Period = RegularPeriod | PlayoffPeriod;
    const [selectedPeriods, setSelectedPeriods] = useState<Set<Period>>(new Set(Object.values(RegularPeriod) as Period[]));
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(new Set(Object.values(ActionType)));
    const availablePeriods = Array.from(new Set(gameData.actions.map(action => action.period)));
    const availableActionTypes = Array.from(new Set(gameData.actions.map(action => action.type)));
    const [sortBy, setSortBy] = useState<keyof IPlayer>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    const filteredActions = gameData.actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action.team.id === gameData.teams.home.id) ||
            (selectedTeamView === 'away' && action.team.id === gameData.teams.away.id);

        const periodFilter = selectedPeriods.has(action.period);
        const typeFilter = selectedActionTypes.has(action.type);

        const playerFilter = !selectedPlayer || action.player.id === selectedPlayer;
        return teamFilter && periodFilter && typeFilter && playerFilter;
    });


    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);

    const updateIconSize = () => {
        if (fieldImageRef.current) {
            const imageWidth = fieldImageRef.current.offsetWidth;
            // Calculate icon size as a percentage of image width (3% in this example)
            const newSize = Math.max(Math.floor(imageWidth * 0.03), 20);
            setIconSize(newSize);
        }
    };

    const handleSort = (column: keyof IPlayer) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const togglePeriod = (period: RegularPeriod | PlayoffPeriod) => {
        const newPeriods = new Set(selectedPeriods);
        if (newPeriods.has(period)) {
            newPeriods.delete(period);
        } else {
            newPeriods.add(period);
        }
        setSelectedPeriods(newPeriods);
    };

    const toggleActionType = (type: ActionType) => {
        const newTypes = new Set(selectedActionTypes);
        if (newTypes.has(type)) {
            newTypes.delete(type);
        } else {
            newTypes.add(type);
        }
        setSelectedActionTypes(newTypes);
    };

    const handleIconClick = (action: IGameAction) => {
        setSelectedActionDetails(action);
    };

    const handleCloseIconData = () => {
        setSelectedActionDetails(null);
    };

    const getPlayerStats = (players: IPlayer[], teamId: string) => {
        return players.map(player => {
            const playerActions = gameData.actions.filter(a =>
                a.player.id === player.id &&
                (teamId ? a.team.id === teamId : true) // Only filter by team if teamId is provided
            );

            return {
                ...player,
                goals: playerActions.filter(a => a.type === ActionType.GOAL).length,
                shots: playerActions.filter(a => a.type === ActionType.SHOT).length,
                turnovers: playerActions.filter(a => a.type === ActionType.TURNOVER).length
            };
        });
    };

    const getDisplayPlayers = () => {
        if (selectedTeamView === 'home') {
            return {
                roster: gameData.teams.home.roster,
                nonRoster: gameData.teams.home.players.filter(p => !gameData.teams.home.roster.some(r => r.id === p.id))
            };

        }
        if (selectedTeamView === 'away') {
            return {
                roster: gameData.teams.away.roster,
                nonRoster: gameData.teams.away.players.filter(p => !gameData.teams.away.roster.some(r => r.id === p.id))
            };
        }
        return {
            roster: [...gameData.teams.home.roster, ...gameData.teams.away.roster],
            nonRoster: [...gameData.teams.home.players, ...gameData.teams.away.players].filter(p => !gameData.teams.home.roster.some(r => r.id === p.id) && !gameData.teams.away.roster.some(r => r.id === p.id))
        };
    };

    const {roster, nonRoster} = getDisplayPlayers();
    const uniqueNonRoster = Array.from(new Map(nonRoster.map(p => [p.id, p])).values());

    const deleteHandler = async (game: IGame) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this game?");
        if (isConfirmed) {
            try {
                await GameService.deleteGame(game);
                navigate('/previous_games');
            } catch (error) {
                console.error("Error deleting action:", error);
            }
        }
    }

    const sortedPlayers = getPlayerStats(roster, selectedTeamView === 'all' ? '' :
        selectedTeamView === 'home' ? gameData.teams.home.id : gameData.teams.away.id)
        .sort((a, b) => {
            let compareValue = 0;

            if (sortBy === 'name' || sortBy === 'position') {
                compareValue = a.name.localeCompare(b.name);
            } else {
                const aValue = a[sortBy as keyof typeof a];
                const bValue = b[sortBy as keyof typeof b];

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    compareValue = aValue - bValue;
                }
            }

            return sortOrder === 'asc' ? compareValue : -compareValue;
        });

    useEffect(() => {
        updateIconSize();

        const handleResize = () => {
            updateIconSize();
        };

        window.addEventListener('resize', handleResize);
        // setPeriodLabel(getPeriodByNumber(period));

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={styles.container}>
            {selectedActionDetails && (
                <IconDataModal
                    action={selectedActionDetails}
                    onClose={handleCloseIconData}
                />
            )}
            <div className={styles.filterSection}>
                {/* Team View Selection */}
                <div className={styles.filterGroup}>
                    <h3 className={styles.filterTitle}>Team View</h3>
                    <div className={styles.buttonGroup}>
                        <button
                            className={`${styles.button} ${selectedTeamView === 'all' ? styles.buttonActive : ''}`}
                            onClick={() => setSelectedTeamView('all')}
                        >
                            All Teams
                        </button>
                        <button
                            className={`${styles.button} ${selectedTeamView === 'home' ? styles.buttonActive : ''}`}
                            onClick={() => setSelectedTeamView('home')}
                        >
                            Home Team
                        </button>
                        <button
                            className={`${styles.button} ${selectedTeamView === 'away' ? styles.buttonActive : ''}`}
                            onClick={() => setSelectedTeamView('away')}
                        >
                            Away Team
                        </button>
                    </div>
                </div>

                {/* Period Selection */}
                <div className={styles.filterGroup}>
                    <h3 className={styles.filterTitle}>Periods</h3>
                    <div className={styles.buttonGroup}>
                        {availablePeriods.map((period) => (
                            <button
                                key={period}
                                className={`${styles.periodButton} ${
                                    selectedPeriods.has(period) ? styles.periodButtonActive : ''
                                }`}
                                onClick={() => togglePeriod(period)}
                            >
                                Period {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Type Selection */}
                <div className={styles.filterGroup}>
                    <h3 className={styles.filterTitle}>Action Types</h3>
                    <div className={styles.buttonGroup}>
                        {availableActionTypes.map((type) => (
                            <button
                                key={type}
                                className={`${styles.periodButton} ${
                                    selectedActionTypes.has(type) ? styles.periodButtonActive : ''
                                }`}
                                onClick={() => toggleActionType(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Game Visualization */}
            <div className={styles.gameVisualization}>
                <img
                    ref={fieldImageRef}
                    src={gameData.selectedImage}
                    alt="gamePage"
                    className={styles.gameImage}
                />
                {filteredActions.map((action: IGameAction, index: number) => (
                    <div
                        key={index}
                        className={styles.actionIcon}
                        style={{
                            left: `${action.x * 100}%`,
                            top: `${action.y * 100}%`,
                        }}
                    >
                        <Icon
                            type={action.type}
                            teamType={action.team.id === gameData.teams.home.id ? 'HOME' : 'AWAY'}
                            teamColors={action.team.id === gameData.teams.home.id ? gameData.teams.home.homeColor : gameData.teams.away.homeColor}
                            size={iconSize}
                            onClick={() => handleIconClick(action)}
                        />
                    </div>
                ))}
            </div>

            <div className={styles.container}>
                <div className={styles.filterGroup}>
                    {selectedPlayer && (
                        <button
                            className={styles.filterButton}
                            onClick={() => setSelectedPlayer(null)}
                        >
                            Clear Player Filter
                        </button>
                    )}
                    <h3 className={styles.filterTitle}>Player Statistics</h3>
                    <table className={styles.statsTable}>
                        <thead>
                        <tr>
                            {['name', 'jerseyNumber', 'position', 'goals', 'shots', 'turnovers'].map((col) => (
                                <th
                                    key={col}
                                    onClick={() => handleSort(col as keyof IPlayer)}
                                >
                                    {col === 'jerseyNumber' ? 'Number' :
                                        col === 'name' ? 'Name' :
                                            col[0].toUpperCase() + col.slice(1)}
                                    {sortBy === col && (
                                        <span className={styles.sortIndicator}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {sortedPlayers.map((player) => (
                            <tr
                                key={player.id}
                                className={`${styles.playerRow} ${selectedPlayer === player.id ? styles.selectedRow : ''}`}
                                onClick={() => setSelectedPlayer(player.id)}
                            >
                                <td>{player.name}</td>
                                <td>{player.jerseyNumber}</td>
                                <td>{player.position}</td>
                                <td>{player.goals}</td>
                                <td>{player.shots}</td>
                                <td>{player.turnovers}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {uniqueNonRoster.length > 0 && (
                        <>
                            <h4 className={styles.nonRosterTitle}>Non-Roster Players</h4>
                            <ul className={styles.nonRosterList}>
                                {uniqueNonRoster.map(player => (
                                    <li className={styles.nonRosterItem} key={player.id}>
                                        {player.name} (#{player.jerseyNumber})
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>

            <button
                className={styles.deleteButton}
                onClick={async () => {
                    await deleteHandler(gameData)
                }}
            >
                Delete Game
            </button>
            <button
                className={styles.button}
                onClick={() => {
                    navigate("/previous_games")
                }}
            >
                Go Back
            </button>
        </div>
    );
};

export default PreviousGameDetailPage;