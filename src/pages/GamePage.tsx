import React, {useEffect, useRef, useState} from 'react';

import {GameType} from "../OOP/enums/GameType";
import {RegularPeriod, PlayoffPeriod} from "../OOP/enums/Period";
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
import ActualGameDetails from './ActualGameDetails';

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
    const savedGameState = location.state?.savedGameState;

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
    const [iconSize, setIconSize] = useState(30);

    const formData = savedGameState ? savedGameState.formData : location.state.formData as FormData;
    const [showDetails, setShowDetails] = useState(true);
    const pressTimer = useRef<number | null>(null);
    const [isLongPress, setIsLongPress] = useState(false); // To track if it's a long press
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [pendingGoalAction, setPendingGoalAction] = useState<IGameAction | null>(null);
    const [isSelectingAssists, setIsSelectingAssists] = useState(false);

    const currentGame: IGame = {
        id: "",
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
            // Store the action temporarily for assist selection
            setPendingGoalAction(newAction);
            setIsSelectingAssists(true);
        } else {
            // Existing logic for non-goal actions
            setActions((prevActions: any) => [...prevActions, newAction]);
            // ...rest of your existing code
        }
        // Close modals
        setSelectedAction(null);
        setSelectedPosition(null);
        setIsModalOpen(false);
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

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                    teamRoster={pendingGoalAction.team.players.filter(player =>
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
                />
            )}

            <div className={styles.mainWrapper}>
                <div className={styles.gameContainer}>
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
                            <p className={styles.timeDisplay}>{formatTime(time)}</p>
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
                        <ActualGameDetails gameData={currentGame}/>
                    </div>
                )}
            </div>
        </>
    );
};

export default GamePage;