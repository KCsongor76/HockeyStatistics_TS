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

type FormData = {
    championship: IChampionship;
    homeTeam: ITeam;
    awayTeam: ITeam;
    gameType: GameType;
    homeColor: ITeamColor;
    awayColor: ITeamColor;
    imageOption: {
        rinkUp: string;
        rinkDown: string;
    };
    selectedImage: string;
};


const GamePage = () => {
    // Add these new state variables
    const [selectedPosition, setSelectedPosition] = useState<{ x: number, y: number } | null>(null);
    const [selectedAction, setSelectedAction] = useState<{ type: ActionType, team: ITeam } | null>(null);
    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);
    const [period, setPeriod] = useState(1);
    const [time, setTime] = useState(5); // 20:00 in seconds TODO: back to 1200
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [homeScore, setHomeScore] = useState<IScoreData>({goals: 0, shots: 0, turnovers: 0});
    const [awayScore, setAwayScore] = useState<IScoreData>({goals: 0, shots: 0, turnovers: 0});
    const [actions, setActions] = useState<IGameAction[]>([]);


    const formData = useLocation().state.formData as FormData;
    const [showDetails, setShowDetails] = useState(true);
    const pressTimer = useRef<number | null>(null);
    const [isLongPress, setIsLongPress] = useState(false); // To track if it's a long press
    const [isModalOpen, setIsModalOpen] = useState(false);

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

        if (newAction.team === formData.homeTeam) {
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

    const handleMouseDown = () => {
        setIsLongPress(false); // Reset the flag at the start

        // Set a timer for long press
        pressTimer.current = window.setTimeout(() => {
            setIsLongPress(true); // Set the flag to indicate a long press occurred
            setShowDetails(prevState => !prevState); // Toggle the state on long press
        }, 500); // 500ms threshold for long press
    };

    const handleMouseUp = () => {
        // Clear the timer if the mouse is released before the long press is detected
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const saveGameRecord = async (game: IGame): Promise<void> => {
        try {
            await GameService.saveGame(game)
            alert("Game saved successfully.")
        } catch (e) {
            console.log(e)
            alert("Failed to save the game. Please try again.")
        }
    }

    const submitGameHandler = async (): Promise<void> => {
        const timestamp = new Date().toISOString();
        const score = {home: homeScore, away: awayScore};
        const teams = {home: formData.homeTeam, away: formData.awayTeam};

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

    // @ts-ignore
    return (
        <>
            {selectedPosition && !selectedAction && (
                <ActionSelectorModal
                    homeTeam={formData.homeTeam}
                    awayTeam={formData.awayTeam}
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
                        src={formData.selectedImage}
                        alt="gamePage"
                        className={styles.fieldImage}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp} // Handle the case when the mouse leaves the image
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
                                teamColors={action.team === formData.homeTeam ? formData.homeColor : formData.awayColor}
                                size={30}
                                onClick={(e: React.MouseEvent<Element, MouseEvent>) => handleIconClick(action, e)}
                            />
                        </div>
                    ))}
                </div>
                {showDetails ? (
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
                ) : (
                    <div className={styles.compactControls}>
                        <div className={styles.compactStats}>
                            <p className={styles.compactPeriod}>Period: {period}</p>
                            <p className={styles.compactTime}>{formatTime(time)}</p>
                            <p className={styles.compactScore}>{homeScore.goals} - {awayScore.goals}</p>
                        </div>

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
                )}
            </div>
        </>
    );
};

export default GamePage;