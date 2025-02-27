import React, {useEffect, useRef, useState} from 'react';
import {GameType} from "../OOP/enums/GameType";
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

// todo: implement time handlers: ot, so, OT1 ...
// todo: if routing gets fired, ask before, might be a misclick

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
    // Add these new state variables
    const [selectedPosition, setSelectedPosition] = useState<{ x: number, y: number } | null>(null);
    const [selectedAction, setSelectedAction] = useState<{ type: ActionType, team: ITeamRoster } | null>(null);
    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);
    const [period, setPeriod] = useState(1);
    const [time, setTime] = useState(5); // 20:00 in seconds TODO: back to 1200
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [homeScore, setHomeScore] = useState<IScoreData>({goals: 0, shots: 0, turnovers: 0});
    const [awayScore, setAwayScore] = useState<IScoreData>({goals: 0, shots: 0, turnovers: 0});
    const [actions, setActions] = useState<IGameAction[]>([]);

    const fieldImageRef = useRef<HTMLImageElement>(null);
    const [iconSize, setIconSize] = useState(30);

    const formData = useLocation().state.formData as FormData;
    const homeRoster = formData.homeRoster as IPlayer[];
    const awayRoster = formData.awayRoster as IPlayer[];
    const [showDetails, setShowDetails] = useState(true);
    const pressTimer = useRef<number | null>(null);
    const [isLongPress, setIsLongPress] = useState(false); // To track if it's a long press
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        setActions([...actions, newAction]);

        if (newAction.team.id === formData.homeTeam.id) { // todo: .equals
            setHomeScore(current => handleScoreUpdate(newAction.team, newAction.type, current));
        } else {
            setAwayScore(current => handleScoreUpdate(newAction.team, newAction.type, current));
        }

        setSelectedAction(null);
        setSelectedPosition(null);
        setIsModalOpen(false);
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

    const saveGameRecord = async (game: IGame): Promise<void> => {
        try {
            // do you really want to save the game?

            if (window.confirm("Are you sure you want to save this game?")) {
                await GameService.saveGame(game)
                alert("Game saved successfully.")
            } else {
                alert("Game saving aborted.")
            }
        } catch (e) {
            console.log(e)
            alert("Failed to save the game. Please try again.")
        }
    }

    const submitGameHandler = async (): Promise<void> => {
        const timestamp = new Date().toISOString();
        const score = {home: homeScore, away: awayScore};
        const teams = {
            home: {...formData.homeTeam, roster: homeRoster} as ITeamRoster,
            away: {...formData.awayTeam, roster: awayRoster} as ITeamRoster
        };

        const game: IGame = {
            id: "",
            timestamp: timestamp,
            actions: actions,
            teams: teams,
            score: score,
            selectedImage: formData.selectedImage
        };

        await saveGameRecord(game);
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning && time > 0) {
            interval = setInterval(() => {
                setTime((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, time]);

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

    console.log(formData);
    console.log(actions);

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
            {selectedActionDetails && (
                <IconDataModal
                    action={selectedActionDetails}
                    onClose={handleCloseIconData}
                />
            )}
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
                    {showDetails && actions.map((action, index) => (
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
                                teamColors={action.team.id === formData.homeTeam.id ? formData.homeColor : formData.awayColor /*TODO: oop - .equals method*/}
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
                        <p className={styles.periodDisplay}>Period: {period}</p>
                        <p className={styles.timeDisplay}>{formatTime(time)}</p>
                        <p className={styles.scoreDisplay}>{homeScore.goals} - {awayScore.goals}</p>

                        <div className={styles.buttonContainer}>
                            {isTimerRunning ? (
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
                            )}

                            {!isTimerRunning && time === 0 && period < 3 && (
                                <button
                                    className={`${styles.button} ${styles.primaryButton}`}
                                    onClick={() => {
                                        setPeriod(p => p + 1);
                                        setTime(formData.gameType === GameType.REGULAR ? 5 : 5); // TODO: back to 1200
                                    }}
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
        </>
    );
};

export default GamePage;