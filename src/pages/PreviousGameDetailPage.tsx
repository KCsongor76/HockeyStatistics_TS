import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {ActionType} from "../OOP/enums/ActionType";
import {PlayoffPeriod, RegularPeriod} from "../OOP/enums/Period";
// @ts-ignore
import styles from './PreviousGameDetailPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";
import {IGameAction} from "../OOP/interfaces/IGameAction";
import IconDataModal from "../modals/IconDataModal";
import {GameService} from "../OOP/services/GameService";
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {GameType} from "../OOP/enums/GameType";
import TeamStats from '../components/TeamStats';
import ScoreDisplay from '../components/ScoreDisplay';
import TeamViewFilter from '../components/TeamViewFilter';
import PeriodFilter from '../components/PeriodFilter';
import ActionTypeFilter from '../components/ActionTypeFilter';
import GameVisualization from '../components/GameVisualization';
import PlayerTable from '../components/PlayerTable';

const PreviousGameDetailPage = () => {
    const location = useLocation();
    const gameData = location.state as IGame;
    const navigate = useNavigate();
    const isPlayoff = gameData.type === GameType.PLAYOFF;

    const fieldImageRef = useRef<HTMLImageElement>(null);
    const [iconSize, setIconSize] = useState(30);

    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    type Period = RegularPeriod | PlayoffPeriod;
    const [selectedPeriods, setSelectedPeriods] = useState<Set<Period>>(new Set(Object.values(RegularPeriod) as Period[]));
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(new Set(Object.values(ActionType)));
    // const availablePeriods = isPlayoff
    //     ? Object.values(PlayoffPeriod).filter(v => typeof v === 'number') as PlayoffPeriod[]
    //     : Object.values(RegularPeriod).filter(v => typeof v === 'number') as RegularPeriod[];
    const availablePeriods = Array.from(new Set(gameData.actions.map(action => action.period)));
    const availableActionTypes = Array.from(new Set(gameData.actions.map(action => action.type)));
    const [sortBy, setSortBy] = useState<keyof IPlayer>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    const calculateActionTimeSeconds = (action: IGameAction): number => {
        const period = action.period;
        let periodStart = 0;
        let periodDuration = 0;

        if (isPlayoff) {
            if (period <= 3) {
                periodDuration = 1200;
                periodStart = (period - 1) * 1200;
            } else {
                periodDuration = 1200;
                const otNumber = period - 3;
                periodStart = 3600 + (otNumber - 1) * 1200;
            }
        } else {
            if (period <= 3) {
                periodDuration = 1200;
                periodStart = (period - 1) * 1200;
            } else if (period === 4) { // OT
                periodDuration = 300;
                periodStart = 3600;
            } else if (period === 5) { // SO
                periodDuration = 0;
                periodStart = 3600 + 300; // 3900
            }
        }

        const elapsedInPeriod = periodDuration - action.time;
        return periodStart + elapsedInPeriod;
    };

    const initialActionTimes = gameData.actions.map(a => calculateActionTimeSeconds(a));
    const defaultMaxTime = isPlayoff ? 4800 : 3900; // OT1 for playoff, OT for regular
    const initialMaxTime = initialActionTimes.length > 0 ? Math.max(...initialActionTimes) : defaultMaxTime;
    const [timeFilter, setTimeFilter] = useState<[number, number]>([0, initialMaxTime]);
    const minTime = 0;
    // const maxTime = initialMaxTime;
    const [maxTime, setMaxTime] = useState(defaultMaxTime);

    const isTimeFilterActive = timeFilter[0] > minTime || timeFilter[1] < maxTime;

    const filteredActions = gameData.actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action.team.id === gameData.teams.home.id) ||
            (selectedTeamView === 'away' && action.team.id === gameData.teams.away.id);

        // const periodFilter = selectedPeriods.has(action.period);
        const typeFilter = selectedActionTypes.has(action.type);
        const playerFilter = !selectedPlayer || action.player.id === selectedPlayer;

        const actionTimeSeconds = calculateActionTimeSeconds(action);
        const timeFilterPass = actionTimeSeconds >= timeFilter[0] &&
            actionTimeSeconds <= timeFilter[1];
        const periodFilter = isTimeFilterActive ? true : selectedPeriods.has(action.period);

        return teamFilter && periodFilter && typeFilter && playerFilter && timeFilterPass;
    });

    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);


    const updateIconSize = () => {
        if (fieldImageRef.current) {
            const imageWidth = fieldImageRef.current.offsetWidth;
            // Calculate icon size as a percentage of image width (3% in this example)
            const newSize = Math.max(Math.floor(imageWidth * 0.01), 20);
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
                shots: playerActions.filter(a => a.type === ActionType.SHOT || a.type === ActionType.GOAL).length,
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
                navigate(-1);
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

    const goalies = sortedPlayers.filter(player => player.position === 'Goalie');
    const defenders = sortedPlayers.filter(player => player.position === 'Defender');
    const forwards = sortedPlayers.filter(player => player.position === 'Forward');

    const positionGroups = [
        {title: 'Goalies', players: goalies},
        {title: 'Defenders', players: defenders},
        {title: 'Forwards', players: forwards}
    ];

    const homeStats = {
        goals: filteredActions.filter(a =>
            a.team.id === gameData.teams.home.id &&
            a.type === ActionType.GOAL
        ).length,
        shots: filteredActions.filter(a =>
            a.team.id === gameData.teams.home.id &&
            (a.type === ActionType.SHOT || a.type === ActionType.GOAL)
        ).length,
        turnovers: filteredActions.filter(a =>
            a.team.id === gameData.teams.home.id &&
            a.type === ActionType.TURNOVER
        ).length
    };

    const awayStats = {
        goals: filteredActions.filter(a =>
            a.team.id === gameData.teams.away.id &&
            a.type === ActionType.GOAL
        ).length,
        shots: filteredActions.filter(a =>
            a.team.id === gameData.teams.away.id &&
            (a.type === ActionType.SHOT || a.type === ActionType.GOAL)
        ).length,
        turnovers: filteredActions.filter(a =>
            a.team.id === gameData.teams.away.id &&
            a.type === ActionType.TURNOVER
        ).length
    };

    const TableHeader = () => (
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
    );

    useEffect(() => {
        updateIconSize();
        const handleResize = () => {
            updateIconSize();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setSelectedPlayer(null); // Clear player selection when team view changes
    }, [selectedTeamView]); // Trigger when selectedTeamView changes

    useEffect(() => {
        const actionTimes = gameData.actions.map(a => calculateActionTimeSeconds(a));
        const newMaxTime = actionTimes.length > 0 ? Math.max(...actionTimes) : defaultMaxTime;
        setMaxTime(newMaxTime);
        setTimeFilter(prev => [prev[0], newMaxTime]);
    }, [gameData.actions, defaultMaxTime]);

    return (
        <div className={styles.container}>
            {selectedActionDetails && (
                <IconDataModal
                    action={selectedActionDetails}
                    onClose={handleCloseIconData}
                    gameType={gameData.type}
                />
            )}

            <h1>Full game stats</h1>
            <div className={styles.statsContainer}>
                <TeamStats team={gameData.teams.home} stats={gameData.score.home}/>
                <ScoreDisplay homeScore={gameData.score.home.goals} awayScore={gameData.score.away.goals}/>
                <TeamStats team={gameData.teams.away} stats={gameData.score.away}/>
            </div>

            <h1>Active filtered stats (period/time/space/player)</h1>
            <div className={styles.statsContainer}>
                <TeamStats team={gameData.teams.home} stats={homeStats}/>
                <ScoreDisplay homeScore={homeStats.goals} awayScore={awayStats.goals}/>
                <TeamStats team={gameData.teams.away} stats={awayStats}/>
            </div>

            <div className={styles.filterSection}>
                <TeamViewFilter selectedView={selectedTeamView} setSelectedView={setSelectedTeamView}/>
                <PeriodFilter
                    gameType={gameData.type}
                    availablePeriods={availablePeriods}
                    selectedPeriods={selectedPeriods}
                    togglePeriod={togglePeriod}
                    isTimeFilterActive={isTimeFilterActive}
                />
                <ActionTypeFilter
                    availableActionTypes={availableActionTypes}
                    selectedActionTypes={selectedActionTypes}
                    toggleActionType={toggleActionType}
                />
            </div>

            <GameVisualization
                gameData={gameData}
                filteredActions={filteredActions}
                iconSize={iconSize}
                handleIconClick={handleIconClick}
            />

            <div className={styles.container}>
                <PlayerTable
                    positionGroups={positionGroups}
                    selectedPlayer={selectedPlayer}
                    setSelectedPlayer={setSelectedPlayer}
                    TableHeader={TableHeader}
                />

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

            <button className={styles.deleteButton} onClick={() => deleteHandler(gameData)}>
                Delete Game
            </button>
            <button className={styles.button} onClick={() => navigate(-1)}>
                Go Back
            </button>
        </div>
    );
};

export default PreviousGameDetailPage;