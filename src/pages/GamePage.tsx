import React, {useEffect, useRef, useState} from 'react';
// @ts-ignore
import ReactSlider from 'react-slider';
import {GameType} from "../OOP/enums/GameType";
import {PlayoffPeriod, RegularPeriod} from "../OOP/enums/Period";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import {useLocation} from "react-router-dom";
import {ActionType} from "../OOP/enums/ActionType";
import Icon from "../components/Icon";
import {IChampionship} from "../OOP/interfaces/IChampionship";
import {ITeam} from "../OOP/interfaces/ITeam";
import {IScoreData} from "../OOP/interfaces/IScoreData";
import {IGameAction} from "../OOP/interfaces/IGameAction";
import {IGame} from "../OOP/interfaces/IGame";
import {GameService} from "../OOP/services/GameService";
import ActionSelectorModal from "../modals/ActionSelectorModal";
import PlayerSelectorModal from "../modals/PlayerSelectorModal";
// @ts-ignore
import styles from './GamePage.module.css';
import IconDataModal from "../modals/IconDataModal";
import {IPlayer} from "../OOP/interfaces/IPlayer";
import AssistSelectorModal from "../modals/AssistSelectorModal";


type FormData = {
    championship: IChampionship;
    homeTeam: ITeam;
    awayTeam: ITeam;
    homeRoster: IPlayer[],
    homeRosterOut: IPlayer[],
    awayRosterOut: IPlayer[],
    awayRoster: IPlayer[],
    gameType: GameType;
    homeColor: ITeamColor;
    awayColor: ITeamColor;
    imageOption: {
        rinkUp: string;
        rinkDown: string;
    };
    selectedImage: string;
};

interface ITeamRoster extends ITeam {
    roster: IPlayer[]
}


const GamePage = () => {
    const location = useLocation();
    const savedGameState = localStorage.getItem("unfinishedGame") ? JSON.parse(localStorage.getItem("unfinishedGame") as string) : location.state?.savedGameState;

    const [selectedPosition, setSelectedPosition] = useState<{ x: number, y: number } | null>(null);
    const [selectedAction, setSelectedAction] = useState<{ type: ActionType, team: ITeamRoster } | null>(null);
    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);
    const [period, setPeriod] = useState(savedGameState?.period || 1);
    const [time, setTime] = useState(savedGameState?.time || 5);
    const [isTimerRunning, setIsTimerRunning] = useState(savedGameState?.isTimerRunning || false);
    const [homeScore, setHomeScore] = useState(savedGameState?.homeScore || {goals: 0, shots: 0, turnovers: 0});
    const [awayScore, setAwayScore] = useState(savedGameState?.awayScore || {goals: 0, shots: 0, turnovers: 0});
    const [actions, setActions] = useState(savedGameState?.actions || []);
    const [periodLabel, setPeriodLabel] = useState(savedGameState?.periodLabel || "1st");
    const [isGameOver, setIsGameOver] = useState(savedGameState?.isGameOver || false);
    const fieldImageRef = useRef<HTMLImageElement>(null);
    const visualizationImageRef = useRef<HTMLImageElement>(null);
    const [iconSize, setIconSize] = useState(30);

    const formData = savedGameState ? savedGameState.formData : location.state.formData as FormData;
    const [showDetails, setShowDetails] = useState(true);
    const pressTimer = useRef<number | null>(null);
    const [isLongPress, setIsLongPress] = useState(false); // To track if it's a long press
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [pendingGoalAction, setPendingGoalAction] = useState<IGameAction | null>(null);
    const [isSelectingAssists, setIsSelectingAssists] = useState(false);

    console.log(homeScore)

    const gameData: IGame = {
        id: "",
        type: formData.gameType,
        timestamp: new Date().toISOString(),
        actions: actions,
        teams: {
            home: {...formData.homeTeam, roster: formData.homeRoster},
            away: {...formData.awayTeam, roster: formData.awayRoster}
        },
        score: {home: homeScore, away: awayScore},
        selectedImage: formData.selectedImage,
        championship: formData.championship
    };
    const isPlayoff = gameData.type === GameType.PLAYOFF;

    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    type Period = RegularPeriod | PlayoffPeriod;
    const [selectedPeriods, setSelectedPeriods] = useState<Set<Period>>(new Set(Object.values(RegularPeriod) as Period[]));
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(new Set(Object.values(ActionType)));
    const [sortBy, setSortBy] = useState<keyof IPlayer>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    const calculateActionTimeSeconds = (action: IGameAction): number => {
        const period = action.period;
        let periodStart = 0;
        let periodDuration = 0;

        if (gameData.type === GameType.PLAYOFF) {
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

    const availablePeriods = Array.from(new Set(gameData.actions.map(action => action.period)));
    const availableActionTypes = Array.from(new Set(gameData.actions.map(action => action.type)));
    // const minTime = 0;
    // const maxTime = Math.max(...gameData.actions.map(a => a.time * 60), 3600);
    const isTimeFilterActive = timeFilter[0] > minTime || timeFilter[1] < maxTime;

    const filteredActions = gameData.actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action.team.id === gameData.teams.home.id) ||
            (selectedTeamView === 'away' && action.team.id === gameData.teams.away.id);
        const periodFilter = selectedPeriods.has(action.period);
        const typeFilter = selectedActionTypes.has(action.type);
        const playerFilter = !selectedPlayer || action.player.id === selectedPlayer;
        const actionTimeSeconds = calculateActionTimeSeconds(action)
        const timeFilterPass = actionTimeSeconds >= timeFilter[0] && actionTimeSeconds <= timeFilter[1];

        return teamFilter && periodFilter && typeFilter && playerFilter && timeFilterPass;
    });


    const updateIconSize = () => {
        if (fieldImageRef.current) {
            const imageWidth = fieldImageRef.current.offsetWidth;
            // Calculate icon size as a percentage of image width (3% in this example)
            const newSize = Math.max(Math.floor(imageWidth * 0.03), 20);
            setIconSize(newSize);
        }
    };

    const handleScoreUpdate = (team: ITeam, actionType: ActionType, currentScore: IScoreData): IScoreData => {
        const newScore = {...currentScore};

        switch (actionType) {
            case ActionType.GOAL:
                newScore.goals += 1;
                newScore.shots += 1;

                // If in OT and a goal is scored, end the game
                if (periodLabel.includes("OT")) {
                    setIsTimerRunning(false); // Stop the clock
                    setIsGameOver(true); // Mark game as over
                }
                break;
            case ActionType.SHOT:
                newScore.shots += 1;
                break;
            case ActionType.TURNOVER:
                newScore.turnovers += 1;
                break;
        }

        return newScore;
    };


    const handleActionComplete = (newAction: IGameAction) => {
        if (newAction.type === ActionType.GOAL) {
            if (gameData.type === GameType.REGULAR && period === RegularPeriod.SO) {
                // Shootout goal, no assists
                const completedAction = {...newAction, assists: []};
                setActions((prev: any) => [...prev, completedAction]);
                // Update score
                if (completedAction.team.id === formData.homeTeam.id) {
                    setHomeScore((current: IScoreData) => handleScoreUpdate(completedAction.team, completedAction.type, current));
                } else {
                    setAwayScore((current: IScoreData) => handleScoreUpdate(completedAction.team, completedAction.type, current));
                }
            } else {
                setPendingGoalAction(newAction);
                setIsSelectingAssists(true);
            }
        } else {
            // Update scores for non-goal actions
            setActions((prevActions: any) => [...prevActions, newAction]);
            if (newAction.team.id === formData.homeTeam.id) {
                setHomeScore((current: IScoreData) => handleScoreUpdate(newAction.team, newAction.type, current));
            } else {
                setAwayScore((current: IScoreData) => handleScoreUpdate(newAction.team, newAction.type, current));
            }
        }

        // Close modals
        setSelectedAction(null);
        setSelectedPosition(null);
        setIsModalOpen(false);

        const gameState = {
            formData,
            period,
            time,
            isTimerRunning,
            homeScore,
            awayScore,
            actions,
            periodLabel,
            isGameOver,
        };
        localStorage.removeItem("unfinishedGame");
        localStorage.setItem('unfinishedGame', JSON.stringify(gameState));
        console.log("localstorage")
    };

    const handleAssistSelection = (assists: IPlayer[]) => {
        if (pendingGoalAction) {
            const completedAction = {
                ...pendingGoalAction,
                assists: assists
            };
            setActions((prev: any) => [...prev, completedAction]);

            // Update scores (same as before)
            if (completedAction.team.id === formData.homeTeam.id) {
                setHomeScore((current: IScoreData) => handleScoreUpdate(completedAction.team, completedAction.type, current));
            } else {
                setAwayScore((current: IScoreData) => handleScoreUpdate(completedAction.team, completedAction.type, current));
            }
        }
        setPendingGoalAction(null);
        setIsSelectingAssists(false);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Check if the click target is or contains an icon
        if (isLongPress || isModalOpen || (e.target as Element).closest('.actionIcon')) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setSelectedPosition({x, y});
        setIsModalOpen(true);
    };

    const handleIconClick = (action: IGameAction, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the event from bubbling up
        setSelectedActionDetails(action);
        setIsModalOpen(true);
    };

    const handleCancelAction = () => {
        setSelectedPosition(null);
        setSelectedAction(null);
        setIsModalOpen(false);
    };

    const handleCloseIconData = () => {
        setSelectedActionDetails(null);
        setIsModalOpen(false);
    };

    // Update the existing handleMouseDown and handleMouseUp functions
    const startPressTimer = () => {
        setIsLongPress(false);
        pressTimer.current = window.setTimeout(() => {
            setIsLongPress(true);
            setShowDetails(prev => !prev);
        }, 500);
    };

    const clearPressTimer = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const handleMouseDown = () => {
        startPressTimer();
    };

    const handleMouseUp = () => {
        clearPressTimer();
    };

    // Add new touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault(); // Prevent default touch behavior (context menu)
        startPressTimer();
    };

    const handleTouchEnd = () => {
        clearPressTimer();
    };

    const submitGameHandler = async (): Promise<void> => {
        const timestamp = new Date().toISOString();
        const score = {home: homeScore, away: awayScore};
        const teams = {
            home: {...formData.homeTeam, roster: formData.homeRoster} as ITeamRoster,
            away: {...formData.awayTeam, roster: formData.awayRoster} as ITeamRoster
        };

        const game: IGame = {
            id: "",
            type: formData.gameType,
            timestamp: timestamp,
            actions: actions,
            teams: teams,
            score: score,
            selectedImage: formData.selectedImage,
            championship: formData.championship
        };

        try {
            if (window.confirm("Are you sure you want to save this game?")) {
                await GameService.saveGame(game);
                alert("Game saved successfully.");
                localStorage.removeItem('unfinishedGame'); // Remove from localStorage
            } else {
                alert("Game saving aborted.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to save the game. Please try again.");
        }
    };

    // Updated time handlers for regular/playoff periods
    const getPeriodByNumber = (num: number): string => {
        if (formData.gameType === GameType.REGULAR) {
            switch (num) {
                case RegularPeriod.FIRST:
                    return "1st";
                case RegularPeriod.SECOND:
                    return "2nd";
                case RegularPeriod.THIRD:
                    return "3rd";
                case RegularPeriod.OT:
                    return "OT";
                case RegularPeriod.SO:
                    return "SO";
                default:
                    return `${num}`;
            }
        } else { // PLAYOFF
            switch (num) {
                case PlayoffPeriod.FIRST:
                    return "1st";
                case PlayoffPeriod.SECOND:
                    return "2nd";
                case PlayoffPeriod.THIRD:
                    return "3rd";
                case PlayoffPeriod.OT1:
                    return "OT1";
                case PlayoffPeriod.OT2:
                    return "OT2";
                case PlayoffPeriod.OT3:
                    return "OT3";
                case PlayoffPeriod.OT4:
                    return "OT4";
                case PlayoffPeriod.OT5:
                    return "OT5";
                default:
                    return `${num}`;
            }
        }
    };

    const handleNextPeriod = () => {
        // First check if the game is tied - only then should we go to OT
        const REGULAR_PERIOD_DURATION = 1200; // 20 minutes
        const OT_PERIOD_DURATION = 300; // 5 minutes

        const isTied = homeScore.goals === awayScore.goals;

        if (formData.gameType === GameType.REGULAR) {
            if (period === RegularPeriod.THIRD && isTied) {
                // Move to OT
                setPeriod(RegularPeriod.OT);
                setPeriodLabel("OT");
                setTime(5); // 5 minutes for OT
            } else if (period === RegularPeriod.OT && isTied) {
                // Move to Shootout
                setPeriod(RegularPeriod.SO);
                setPeriodLabel("SO");
                setTime(0); // No timer for shootout
                setIsGameOver(true);
            } else if (period < RegularPeriod.THIRD) {
                // Regular period progression
                setPeriod((prev: number) => prev + 1);
                setPeriodLabel(getPeriodByNumber(period + 1));
                setTime(5); // 20 minutes back to 1200
            } else {
                // Game is over
                setIsGameOver(true);
            }
        } else { // PLAYOFF
            if (period === PlayoffPeriod.THIRD && isTied) {
                // Move to first OT
                setPeriod(PlayoffPeriod.OT1);
                setPeriodLabel("OT1");
                setTime(5); // 20 minutes for playoff OT
            } else if (period >= PlayoffPeriod.OT1 && period < PlayoffPeriod.OT5 && isTied) {
                // Move to next OT
                setPeriod((prev: number) => prev + 1);
                setPeriodLabel(getPeriodByNumber(period + 1));
                setTime(5); // 20 minutes for each playoff OT
            } else if (period === PlayoffPeriod.OT5 && isTied) {
                // End after 5 OTs (rarely happens)
                setIsGameOver(true);
            } else if (period < PlayoffPeriod.THIRD) {
                // Regular period progression
                setPeriod((prev: number) => prev + 1);
                setPeriodLabel(getPeriodByNumber(period + 1));
                setTime(5); // 20 minutes
            } else {
                // Game is over
                setIsGameOver(true);
            }
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


    // const handleCloseIconData = () => {
    //     setSelectedActionDetails(null);
    // };

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

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const goalies = sortedPlayers.filter(player => player.position === 'Goalie');
    const defenders = sortedPlayers.filter(player => player.position === 'Defender');
    const forwards = sortedPlayers.filter(player => player.position === 'Forward');

    const positionGroups = [
        {title: 'Goalies', players: goalies},
        {title: 'Defenders', players: defenders},
        {title: 'Forwards', players: forwards}
    ];

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
        setSelectedPlayer(null);
    }, [selectedTeamView]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && time > 0) {
            interval = setInterval(() => {
                setTime((prev: number) => prev - 1);
            }, 1000);
        } else if (time === 0 && isTimerRunning) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, time]);

    useEffect(() => {
        updateIconSize();

        const handleResize = () => {
            updateIconSize();
        };

        window.addEventListener('resize', handleResize);
        setPeriodLabel(getPeriodByNumber(period));

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const actionTimes = gameData.actions.map(a => calculateActionTimeSeconds(a));
        const newMaxTime = actionTimes.length > 0 ? Math.max(...actionTimes) : defaultMaxTime;
        setMaxTime(newMaxTime);
        setTimeFilter(prev => [prev[0], newMaxTime]);
    }, [gameData.actions, defaultMaxTime]);


    useEffect(() => {
        const gameState = {
            formData,
            period,
            time,
            isTimerRunning,
            homeScore,
            awayScore,
            actions,
            periodLabel,
            isGameOver,
        };
        console.log("useEffect")
        localStorage.setItem('unfinishedGame', JSON.stringify(gameState));
    }, [formData, period, time, isTimerRunning, homeScore, awayScore, actions, periodLabel, isGameOver]);

    return (
        <>
            {selectedPosition && !selectedAction && (
                <ActionSelectorModal
                    homeTeam={formData.homeTeam}
                    homeRoster={formData.homeRoster}
                    awayTeam={formData.awayTeam}
                    awayRoster={formData.awayRoster}
                    homeColor={formData.homeColor}
                    awayColor={formData.awayColor}
                    onActionSelect={setSelectedAction}
                    onCancel={handleCancelAction}
                />
            )}

            {selectedAction && (
                <PlayerSelectorModal
                    selectedAction={selectedAction}
                    selectedPosition={selectedPosition}
                    period={period}
                    time={time}
                    onActionComplete={handleActionComplete}
                    onCancel={handleCancelAction}
                />
            )}

            {isSelectingAssists && pendingGoalAction && (
                <AssistSelectorModal
                    teamRoster={pendingGoalAction.team.roster.filter(player =>
                        player.id !== pendingGoalAction.player.id
                    )}
                    onAssistSelected={handleAssistSelection}
                    onCancel={() => {
                        setIsSelectingAssists(false);
                        setPendingGoalAction(null);
                    }}
                />
            )}

            {selectedActionDetails && (
                <IconDataModal
                    action={selectedActionDetails}
                    onClose={handleCloseIconData}
                    gameType={gameData.type}
                />
            )}

            <div className={styles.mainWrapper}>
                <div className={`${styles.gameContainer} ${!showDetails ? styles.fullWidth : ''}`}>
                    <div
                        className={styles.fieldContainer}
                        onClick={handleClick}
                    >
                        <img
                            ref={fieldImageRef}
                            src={formData.selectedImage}
                            alt="gamePage"
                            className={styles.fieldImage}
                            // Mouse events
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            // Touch events
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onTouchCancel={handleTouchEnd}
                        />
                        {showDetails && actions.map((action: IGameAction, index: React.Key | null | undefined) => (
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
                                    teamType={action.team === formData.homeTeam ? 'HOME' : 'AWAY'}
                                    teamColors={action.team.id === formData.homeTeam.id ? formData.homeColor : formData.awayColor /* oop - .equals method*/}
                                    size={iconSize}
                                    onClick={(e: React.MouseEvent<Element, MouseEvent>) => handleIconClick(action, e)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.teamInfo}>
                            <img src={formData.homeTeam.logo} alt={formData.homeTeam.name} className={styles.teamLogo}/>
                            <div className={styles.teamStats}>
                                <p className={styles.statItem}>Shots: {homeScore.shots}</p>
                                <p className={styles.statItem}>Turnovers: {homeScore.turnovers}</p>
                            </div>
                        </div>

                        <div className={styles.gameControls}>
                            <p className={styles.periodDisplay}>Period: {periodLabel}</p>
                            <p className={styles.timeDisplay}>{periodLabel === "SO" ? "0:00" : formatTime(time)}</p>
                            <p className={styles.scoreDisplay}>{homeScore.goals} - {awayScore.goals}</p>

                            <div className={styles.buttonContainer}>
                                {!isGameOver && (
                                    isTimerRunning ? (
                                        <button
                                            className={`${styles.button} ${styles.secondaryButton}`}
                                            onClick={() => setIsTimerRunning(false)}
                                        >
                                            Stop Time
                                        </button>
                                    ) : (
                                        time > 0 &&
                                        <button
                                            className={`${styles.button} ${styles.primaryButton}`}
                                            onClick={() => setIsTimerRunning(true)}
                                        >
                                            Start Time
                                        </button>
                                    )
                                )}


                                {!isTimerRunning && time === 0 && !isGameOver && (
                                    <button
                                        className={`${styles.button} ${styles.primaryButton}`}
                                        onClick={handleNextPeriod}
                                    >
                                        Next Period
                                    </button>
                                )}

                                <button
                                    className={`${styles.button} ${styles.successButton}`}
                                    onClick={submitGameHandler}
                                >
                                    End Game
                                </button>
                            </div>
                        </div>

                        <div className={styles.teamInfo}>
                            <img src={formData.awayTeam.logo} alt={formData.awayTeam.name} className={styles.teamLogo}/>
                            <div className={styles.teamStats}>
                                <p className={styles.statItem}>Shots: {awayScore.shots}</p>
                                <p className={styles.statItem}>Turnovers: {awayScore.turnovers}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {showDetails && (
                    <div className={styles.actualDataContainer}>
                        <div className={styles.filterSection}>
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

                            <div className={styles.filterGroup}>
                                <h3 className={styles.filterTitle}>Periods</h3>
                                <div className={styles.buttonGroup}>
                                    {availablePeriods.map((period) => {
                                        const getPeriodLabel = () => {
                                            if (gameData.type === GameType.REGULAR) {
                                                switch (period) {
                                                    case RegularPeriod.FIRST:
                                                    case RegularPeriod.SECOND:
                                                    case RegularPeriod.THIRD:
                                                        return `Period ${period}`;
                                                    case RegularPeriod.OT:
                                                        return 'OT';
                                                    case RegularPeriod.SO:
                                                        return 'SO';
                                                    default:
                                                        return `Period ${period}`;
                                                }
                                            } else {
                                                if (period <= PlayoffPeriod.THIRD) {
                                                    return `Period ${period}`;
                                                } else {
                                                    const otNumber = period - PlayoffPeriod.THIRD;
                                                    return `OT${otNumber}`;
                                                }
                                            }
                                        };

                                        return (
                                            <button
                                                key={period}
                                                className={`${styles.periodButton} ${
                                                    selectedPeriods.has(period) ? styles.periodButtonActive : ''
                                                }`}
                                                onClick={() => togglePeriod(period)}
                                                disabled={isTimeFilterActive}
                                            >
                                                {getPeriodLabel()}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

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

                        <div className={styles.gameVisualization}>
                            <div className={styles.visualizationImageWrapper}>
                                <img
                                    ref={visualizationImageRef}  // Changed from fieldImageRef
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
                                            onClick={(e: React.MouseEvent<Element, MouseEvent>) => handleIconClick(action, e)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <h3 className={styles.filterTitle}>Player Statistics</h3>

                            {positionGroups.map((group) => (
                                group.players.length > 0 && (
                                    <div key={group.title}>
                                        <h4 className={styles.filterTitle}>{group.title}</h4>
                                        <div className={styles.tableContainer}>
                                            <table className={styles.statsTable}>
                                                <TableHeader/>
                                                <tbody>
                                                {group.players.map((player) => (
                                                    <tr
                                                        key={player.id}
                                                        className={`${styles.playerRow} ${selectedPlayer === player.id ? styles.selectedRow : ''}`}
                                                        onClick={() => {
                                                            if (selectedPlayer === player.id) {
                                                                setSelectedPlayer(null);
                                                            } else {
                                                                setSelectedPlayer(player.id);
                                                            }
                                                        }}
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
                                        </div>
                                    </div>
                                )
                            ))}

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

                        {selectedActionDetails && (
                            <IconDataModal
                                action={selectedActionDetails}
                                onClose={() => setSelectedActionDetails(null)}
                                gameType={gameData.type}
                            />
                        )}

                    </div>
                )}
            </div>
        </>
    );
};

export default GamePage;