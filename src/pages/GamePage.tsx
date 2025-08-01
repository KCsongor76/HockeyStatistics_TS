import React, {useEffect, useRef, useState} from 'react';
import {useBlocker, useLocation} from 'react-router-dom';
import ActionSelectorModal from "../modals/ActionSelectorModal";
import PlayerSelectorModal from "../modals/PlayerSelectorModal";
import AssistSelectorModal from "../modals/AssistSelectorModal";
import IconDataModal from "../modals/IconDataModal";
import {IChampionship} from "../OOP/interfaces/IChampionship";
import {IGameAction} from "../OOP/interfaces/IGameAction";
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
import {CustomButton} from "../components/CustomButton";
import GameStatsLive from "../components/GameStatsLive";
import GameFilters from "../components/GameFilters";
import PlayerStatsSection from "../components/PlayerStatsSection";
import RinkWithIconsLive from "../components/RinkWithIconsLive";
import RinkWithIcons from "../components/RinkWithIcons";

// todo: if a user presses the page reload button, make sure to save the latest data, because as of now, every new data is lost on page reloads
//  (probably can't be done in the "declarative react" way, but only in the "imperative javascript" way)

// todo: regular game type, 3rd period, 1-0 score, time runs out, Stop Time button still turns into
//  Next Period button, but this button shouldn't appear in this case. (at least if I click on it, it disappears, and nothing else happens)

// todo: showDetails: only hide icons on first rink image

interface ITeamRoster extends ITeam {
    roster: IPlayer[];
}

const GamePage = () => {
    const location = useLocation();
    const {setup, savedGameState} = location.state || {};

    const [selectedPosition, setSelectedPosition] = useState<{ x: number, y: number } | null>(null);
    const [selectedAction, setSelectedAction] = useState<{ type: ActionType, team: ITeamRoster } | null>(null);
    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);
    const [gameState, setGameState] = useState(new GameState({
        period: savedGameState?.period || 1,
        time: savedGameState?.time || 5,
        isTimerRunning: false, // Force timer to be stopped on load
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
        championship: formData?.championship || {id: "", name: ""}
    };

    const isPlayoff = gameData.type === GameType.PLAYOFF;
    const defaultMaxTime = isPlayoff ? 4800 : 3900;
    const [timeFilter, setTimeFilter] = useState<[number, number]>([0, defaultMaxTime]);
    const [maxTime, setMaxTime] = useState(defaultMaxTime);

    const calculateActionTimeSeconds = (action: IGameAction) =>
        GameAction.calculateActionTimeSeconds(action, gameData.type);

    // const initialActionTimes = gameData.actions.map(a => calculateActionTimeSeconds(a));
    // const initialMaxTime = initialActionTimes.length > 0 ? Math.max(...initialActionTimes) : defaultMaxTime;

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
            gameData.season,
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

        const isFinalPeriod = formData.gameType === GameType.REGULAR
            ? newGameState.period >= RegularPeriod.THIRD && !isTied
            : newGameState.period >= PlayoffPeriod.THIRD && !isTied;

        if (isFinalPeriod) {
            newGameState.isGameOver = true;
            setGameState(newGameState);
            return;
        }

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
    ).map(player => {
        const assists = gameData.actions.filter(a =>
            a.assists?.some(assist => assist.id === player.id)
        ).length;
        return {
            ...player,
            assists,
            points: player.goals + assists
        };
    });

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
        <div className={styles.container}>
            {/* Rink with icons */}
            <div className={styles.rinkContainer}>
                <RinkWithIconsLive
                    ref={fieldImageRef}
                    src={formData.selectedImage}
                    showDetails={showDetails}
                    gameState={gameState}
                    handleClick={handleClick}
                    handleIconClick={handleIconClick}
                    handleMouseDown={handleMouseDown}
                    handleMouseUp={handleMouseUp}
                    handleTouchStart={handleTouchStart}
                    handleTouchEnd={handleTouchEnd}
                />
            </div>

            {/* Game stats */}
            <div className={styles.statsSection}>
                <GameStatsLive
                    formData={formData}
                    gameState={gameState}
                    gameData={gameData}
                    setGameState={setGameState}
                    handleNextPeriod={handleNextPeriod}
                    submitGameHandler={submitGameHandler}
                />
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <CustomButton
                    type="neutral"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? "Hide Details" : "Show Details"}
                </CustomButton>
            </div>

            {showDetails && (
                <>
                    {/* Filters */}
                    <div className={styles.filtersSection}>
                        <GameFilters
                            gameData={gameData}
                            availablePeriods={availablePeriods}
                            availableActionTypes={availableActionTypes}
                            isTimeFilterActive={isTimeFilterActive}
                            setSelectedTeamView={setSelectedTeamView}
                            togglePeriod={togglePeriod}
                            toggleActionType={toggleActionType}
                        />
                    </div>

                    {/* Rink visualization */}
                    <div className={styles.rinkContainer}>
                        <RinkWithIcons
                            imageRef={visualizationImageRef}
                            src={gameData.selectedImage}
                            filteredActions={filteredActions}
                            handleIconClick={handleIconClick}
                            iconSize={iconSize}
                        />
                    </div>

                    {/* Player stats */}
                    <div className={styles.playerStatsSection}>
                        <PlayerStatsSection
                            positionGroups={[]}
                            handleSort={handleSort}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            selectedPlayer={selectedPlayer}
                            setSelectedPlayer={setSelectedPlayer}
                            uniqueNonRoster={uniqueNonRoster}
                            playerStats={playerStats}
                        />
                    </div>
                </>
            )}

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
        </div>
    );
};

export default GamePage;