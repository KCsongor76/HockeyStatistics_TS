import React, {useEffect, useRef, useState} from 'react';
import {useBlocker, useLocation} from 'react-router-dom';
import Icon from "../components/Icon";
import ActionSelectorModal from "../modals/ActionSelectorModal";
import PlayerSelectorModal from "../modals/PlayerSelectorModal";
import AssistSelectorModal from "../modals/AssistSelectorModal";
import IconDataModal from "../modals/IconDataModal";
import {IChampionship} from "../OOP/interfaces/IChampionship";
import {IGameAction} from "../OOP/interfaces/IGameAction";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {ITeam} from "../OOP/interfaces/ITeam";
import {IGame} from "../OOP/interfaces/IGame";
// @ts-ignore
import styles from './GamePage.module.css';
import {TeamWithRoster} from "../OOP/classes/TeamWithRoster";
import {Championship} from "../OOP/classes/Championship";
import {GameAction} from '../OOP/classes/GameAction';
import {GameState} from '../OOP/classes/GameState';
import {GameUtils} from '../OOP/classes/GameUtils';
import {Player} from '../OOP/classes/Player';
import {Game} from "../OOP/classes/Game";
import {PlayoffPeriod, RegularPeriod} from "../OOP/enums/Period";
import {ActionType} from "../OOP/enums/ActionType";
import {GameType} from "../OOP/enums/GameType";
import {GameService} from "../OOP/services/GameService";

// todo: on page reload, we should set the unfinishedgame local storage
// todo: if we save an unfinished game, make sure the timer is stopped,
//  even if when we exit and save, it's still running, on re-continuing, it should be stopped.
// todo: somewhere we should show the season.
// todo: fix the Start Time button (and their group's) logic: next period shouldn't be accessible,
//  if game is finished (eg. 3rd period end), and the score is uneven


type FormData = {
    championship: IChampionship;
    homeTeam: ITeam;
    awayTeam: ITeam;
    homeRoster: IPlayer[];
    homeRosterOut: IPlayer[];
    awayRosterOut: IPlayer[];
    awayRoster: IPlayer[];
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
    roster: IPlayer[];
}

const GamePage = () => {
    const location = useLocation();
    const { setup, savedGameState } = location.state || {};

    const [selectedPosition, setSelectedPosition] = useState<{ x: number, y: number } | null>(null);
    const [selectedAction, setSelectedAction] = useState<{ type: ActionType, team: ITeamRoster } | null>(null);
    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);
    const [gameState, setGameState] = useState(new GameState({
        period: savedGameState?.period || 1,
        time: savedGameState?.time || 5,
        isTimerRunning: savedGameState?.isTimerRunning || false,
        homeScore: savedGameState?.homeScore || {goals: 0, shots: 0, turnovers: 0},
        awayScore: savedGameState?.awayScore || {goals: 0, shots: 0, turnovers: 0},
        actions: savedGameState?.actions || [],
        periodLabel: savedGameState?.periodLabel || "1st",
        isGameOver: savedGameState?.isGameOver || false
    }));

    const formData = setup || savedGameState?.setup;

    const fieldImageRef = useRef<HTMLImageElement>(null);
    const visualizationImageRef = useRef<HTMLImageElement>(null);
    const [iconSize, setIconSize] = useState(30);
    // const formData = savedGameState ? savedGameState.setup : location.state.setup as FormData;
    const [showDetails, setShowDetails] = useState(true);
    const pressTimer = useRef<number | null>(null);
    const [isLongPress, setIsLongPress] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingGoalAction, setPendingGoalAction] = useState<IGameAction | null>(null);
    const [isSelectingAssists, setIsSelectingAssists] = useState(false);
    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    const [selectedPeriods, setSelectedPeriods] = useState<Set<number>>(new Set(Object.values(RegularPeriod) as number[]));
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(new Set(Object.values(ActionType)));
    const [sortBy, setSortBy] = useState<keyof IPlayer>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    console.log("formData", formData);

    const gameData: IGame = {
        id: "",
        type: formData?.gameType || GameType.REGULAR,
        timestamp: new Date().toISOString(),
        actions: gameState.actions,
        teams: {
            home: {...formData?.homeTeam, roster: formData?.homeRoster || []},
            away: {...formData?.awayTeam, roster: formData?.awayRoster || []}
        },
        score: {home: gameState.homeScore, away: gameState.awayScore},
        selectedImage: formData?.selectedImage || "",
        season: formData?.season || "",
        championship: formData?.championship || { id: "", name: "" }
    };

    const isPlayoff = gameData.type === GameType.PLAYOFF;
    const defaultMaxTime = isPlayoff ? 4800 : 3900;
    const [timeFilter, setTimeFilter] = useState<[number, number]>([0, defaultMaxTime]);
    const [maxTime, setMaxTime] = useState(defaultMaxTime);

    const calculateActionTimeSeconds = (action: IGameAction) =>
        GameAction.calculateActionTimeSeconds(action, gameData.type);

    const initialActionTimes = gameData.actions.map(a => calculateActionTimeSeconds(a));
    const initialMaxTime = initialActionTimes.length > 0 ? Math.max(...initialActionTimes) : defaultMaxTime;

    const availablePeriods = Array.from(new Set(gameData.actions.map(action => action.period)));
    const availableActionTypes = Array.from(new Set(gameData.actions.map(action => action.type)));
    const isTimeFilterActive = timeFilter[0] > 0 || timeFilter[1] < maxTime;

    const filteredActions = gameData.actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action.team.id === gameData.teams.home.id) ||
            (selectedTeamView === 'away' && action.team.id === gameData.teams.away.id);
        const periodFilter = selectedPeriods.has(action.period);
        const typeFilter = selectedActionTypes.has(action.type);
        const playerFilter = !selectedPlayer || action.player.id === selectedPlayer;
        const actionTimeSeconds = calculateActionTimeSeconds(action);
        const timeFilterPass = actionTimeSeconds >= timeFilter[0] && actionTimeSeconds <= timeFilter[1];

        return teamFilter && periodFilter && typeFilter && playerFilter && timeFilterPass;
    });

    const updateIconSize = () => {
        if (fieldImageRef.current) {
            const imageWidth = fieldImageRef.current.offsetWidth;
            const newSize = Math.max(Math.floor(imageWidth * 0.03), 20);
            setIconSize(newSize);
        }
    };

    const handleActionComplete = (newAction: IGameAction) => {
        const newGameState = new GameState({...gameState});

        if (newAction.type === ActionType.GOAL) {
            if (gameData.type === GameType.REGULAR && gameState.period === RegularPeriod.SO) {
                const completedAction = {...newAction, assists: []};
                newGameState.addAction(completedAction);
                newGameState.updateScore(completedAction.team.id, completedAction.type, formData.homeTeam.id);

                if (gameState.periodLabel.includes("OT")) {
                    newGameState.isTimerRunning = false;
                    newGameState.isGameOver = true;
                }
            } else {
                setPendingGoalAction(newAction);
                setIsSelectingAssists(true);
            }
        } else {
            newGameState.addAction(newAction);
            newGameState.updateScore(newAction.team.id, newAction.type, formData.homeTeam.id);
        }

        setGameState(newGameState);
        setSelectedAction(null);
        setSelectedPosition(null);
        setIsModalOpen(false);

        localStorage.setItem('unfinishedGame', JSON.stringify({
            formData,
            ...newGameState
        }));
    };

    const handleAssistSelection = (assists: IPlayer[]) => {
        if (pendingGoalAction) {
            const completedAction = {...pendingGoalAction, assists};
            const newGameState = new GameState({...gameState});
            newGameState.addAction(completedAction);
            newGameState.updateScore(completedAction.team.id, completedAction.type, formData.homeTeam.id);
            setGameState(newGameState);
        }
        setPendingGoalAction(null);
        setIsSelectingAssists(false);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isLongPress || isModalOpen || (e.target as Element).closest('.actionIcon')) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setSelectedPosition({x, y});
        setIsModalOpen(true);
    };

    const handleIconClick = (action: IGameAction, e: React.MouseEvent) => {
        e.stopPropagation();
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

    const handleMouseDown = () => startPressTimer();
    const handleMouseUp = () => clearPressTimer();
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        startPressTimer();
    };
    const handleTouchEnd = () => clearPressTimer();

    const submitGameHandler = async () => {
        const championship = {
            id: formData.championship.id,
            name: formData.championship.name
        } as IChampionship;

        const teams = {
            home: TeamWithRoster.fromPlain({...formData.homeTeam, roster: formData.homeRoster} as ITeamRoster),
            away: TeamWithRoster.fromPlain({...formData.awayTeam, roster: formData.awayRoster} as ITeamRoster),
        };

        const game = new Game(
            "",
            new Date().toISOString(),
            gameData.season, // todo check?
            Championship.fromPlain(championship),
            gameState.actions,
            teams,
            {home: gameState.homeScore, away: gameState.awayScore},
            formData.gameType,
            formData.selectedImage
        )

        try {
            if (window.confirm("Are you sure you want to save this game?")) {
                console.log(game.toPlainObject())
                await GameService.saveGame(game);
                alert("Game saved successfully.");
                localStorage.removeItem('unfinishedGame');
            } else {
                alert("Game saving aborted.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to save the game. Please try again.");
        }
    };

    const handleNextPeriod = () => {
        const newGameState = new GameState({...gameState});
        const isTied = newGameState.homeScore.goals === newGameState.awayScore.goals;

        if (formData.gameType === GameType.REGULAR) {
            if (newGameState.period === RegularPeriod.THIRD && isTied) {
                newGameState.period = RegularPeriod.OT;
                newGameState.periodLabel = "OT";
                newGameState.time = 5;
            } else if (newGameState.period === RegularPeriod.OT && isTied) {
                newGameState.period = RegularPeriod.SO;
                newGameState.periodLabel = "SO";
                newGameState.time = 0;
                newGameState.isGameOver = true;
            } else if (newGameState.period < RegularPeriod.THIRD) {
                newGameState.period += 1;
                newGameState.periodLabel = GameUtils.getPeriodLabel(newGameState.period, gameData.type);
                newGameState.time = 5;
            } else {
                newGameState.isGameOver = true;
            }
        } else {
            if (newGameState.period === PlayoffPeriod.THIRD && isTied) {
                newGameState.period = PlayoffPeriod.OT1;
                newGameState.periodLabel = "OT1";
                newGameState.time = 5;
            } else if (newGameState.period >= PlayoffPeriod.OT1 && newGameState.period < PlayoffPeriod.OT5 && isTied) {
                newGameState.period += 1;
                newGameState.periodLabel = GameUtils.getPeriodLabel(newGameState.period, gameData.type);
                newGameState.time = 5;
            } else if (newGameState.period === PlayoffPeriod.OT5 && isTied) {
                newGameState.isGameOver = true;
            } else if (newGameState.period < PlayoffPeriod.THIRD) {
                newGameState.period += 1;
                newGameState.periodLabel = GameUtils.getPeriodLabel(newGameState.period, gameData.type);
                newGameState.time = 5;
            } else {
                newGameState.isGameOver = true;
            }
        }

        setGameState(newGameState);
    };

    const handleSort = (column: keyof IPlayer) => {
        setSortBy(column);
        setSortOrder(prev => sortBy === column ? (prev === 'asc' ? 'desc' : 'asc') : 'asc');
    };

    const togglePeriod = (period: number) => {
        const newPeriods = new Set(selectedPeriods);
        newPeriods.has(period) ? newPeriods.delete(period) : newPeriods.add(period);
        setSelectedPeriods(newPeriods);
    };

    const toggleActionType = (type: ActionType) => {
        const newTypes = new Set(selectedActionTypes);
        newTypes.has(type) ? newTypes.delete(type) : newTypes.add(type);
        setSelectedActionTypes(newTypes);
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
            nonRoster: [...gameData.teams.home.players, ...gameData.teams.away.players].filter(p =>
                !gameData.teams.home.roster.some(r => r.id === p.id) &&
                !gameData.teams.away.roster.some(r => r.id === p.id))
        };
    };

    const {roster, nonRoster} = getDisplayPlayers();
    const uniqueNonRoster = Array.from(new Map(nonRoster.map(p => [p.id, p])).values());
    const playerStats = Player.getPlayerStats(
        roster,
        gameData.actions,
        selectedTeamView === 'all' ? '' : selectedTeamView === 'home' ? gameData.teams.home.id : gameData.teams.away.id
    );

    const sortedPlayers = [...playerStats].sort((a, b) => {
        let compareValue = 0;
        if (sortBy === 'name' || sortBy === 'position') {
            compareValue = a[sortBy].localeCompare(b[sortBy]);
        } else if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
            compareValue = (a[sortBy] as number) - (b[sortBy] as number);
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

    const blocker = useBlocker(({currentLocation, nextLocation}) => {
        return currentLocation.pathname === '/game' && nextLocation.pathname !== '/game';
    });

    useEffect(() => {
        if (blocker.state === 'blocked') {
            const shouldProceed = window.confirm(
                'Are you sure you want to leave? Any unsaved progress will be lost.'
            );
            if (shouldProceed) blocker.proceed();
            else blocker.reset();
        }
    }, [blocker.state]);

    useEffect(() => {
        updateIconSize();
        const handleResize = () => updateIconSize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setSelectedPlayer(null);
    }, [selectedTeamView]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState.isTimerRunning && gameState.time > 0) {
            interval = setInterval(() => {
                setGameState(prev => new GameState({...prev, time: prev.time - 1}));
            }, 1000);
        } else if (gameState.time === 0 && gameState.isTimerRunning) {
            setGameState(prev => new GameState({...prev, isTimerRunning: false}));
        }
        return () => clearInterval(interval);
    }, [gameState.isTimerRunning, gameState.time]);

    useEffect(() => {
        const actionTimes = gameData.actions.map(a => calculateActionTimeSeconds(a));
        const newMaxTime = actionTimes.length > 0 ? Math.max(...actionTimes) : defaultMaxTime;
        setMaxTime(newMaxTime);
        setTimeFilter(prev => [prev[0], newMaxTime]);
    }, [gameData.actions, defaultMaxTime]);

    useEffect(() => {
        localStorage.setItem('unfinishedGame', JSON.stringify({
            formData,
            ...gameState
        }));
    }, [formData, gameState]);

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
                    period={gameState.period}
                    time={gameState.time}
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
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onTouchCancel={handleTouchEnd}
                        />
                        {showDetails && gameState.actions.map((action, index) => (
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
                                    teamColors={action.team.id === formData.homeTeam.id ? formData.homeColor : formData.awayColor}
                                    size={iconSize}
                                    onClick={(e) => handleIconClick(action, e)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.teamInfo}>
                            <img src={formData.homeTeam.logo} alt={formData.homeTeam.name} className={styles.teamLogo}/>
                            <div className={styles.teamStats}>
                                <p className={styles.statItem}>Shots: {gameState.homeScore.shots}</p>
                                <p className={styles.statItem}>Turnovers: {gameState.homeScore.turnovers}</p>
                            </div>
                        </div>

                        <div className={styles.gameControls}>
                            <p className={styles.periodDisplay}>Period: {gameState.periodLabel}</p>
                            <p className={styles.timeDisplay}>{gameState.periodLabel === "SO" ? "0:00" : GameUtils.formatTime(gameState.time)}</p>
                            <p className={styles.scoreDisplay}>{gameState.homeScore.goals} - {gameState.awayScore.goals}</p>

                            <div className={styles.buttonContainer}>
                                {!gameState.isGameOver && (
                                    gameState.isTimerRunning ? (
                                        <button
                                            className={`${styles.button} ${styles.secondaryButton}`}
                                            onClick={() => setGameState(prev => new GameState({
                                                ...prev,
                                                isTimerRunning: false
                                            }))}
                                        >
                                            Stop Time
                                        </button>
                                    ) : (
                                        gameState.time > 0 &&
                                        <button
                                            className={`${styles.button} ${styles.primaryButton}`}
                                            onClick={() => setGameState(prev => new GameState({
                                                ...prev,
                                                isTimerRunning: true
                                            }))}
                                        >
                                            Start Time
                                        </button>
                                    )
                                )}

                                {!gameState.isTimerRunning && gameState.time === 0 && !gameState.isGameOver && (
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
                                    Save Game
                                </button>
                            </div>
                        </div>

                        <div className={styles.teamInfo}>
                            <img src={formData.awayTeam.logo} alt={formData.awayTeam.name} className={styles.teamLogo}/>
                            <div className={styles.teamStats}>
                                <p className={styles.statItem}>Shots: {gameState.awayScore.shots}</p>
                                <p className={styles.statItem}>Turnovers: {gameState.awayScore.turnovers}</p>
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
                                            // teamColors={action.team.id === formData.homeTeam.id ? formData.homeColor : formData.awayColor /* oop - .equals method*/}
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
                                                <thead>
                                                <tr>
                                                    {['name', 'jerseyNumber', 'position', 'goals', 'shots', 'turnovers'].map((col) => (
                                                        <th key={col} onClick={() => handleSort(col as keyof IPlayer)}>
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