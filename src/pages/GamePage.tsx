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
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {IGame} from "../OOP/interfaces/IGame";
import {GameService} from "../OOP/services/GameService";

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
    const [period, setPeriod] = useState(1);
    const [time, setTime] = useState(5); // 20:00 in seconds TODO: back to 1200
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [homeScore, setHomeScore] = useState<IScoreData>({goals: 0, shots: 0, turnovers: 0});
    const [awayScore, setAwayScore] = useState<IScoreData>({goals: 0, shots: 0, turnovers: 0});
    const [actions, setActions] = useState<IGameAction[]>([]);

// Add modal content
    const ActionSelectorModal = () => (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 1000
        }}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {/* Home Team Actions */}
                <div style={{display: 'flex', gap: '10px'}}>
                    {Object.values(ActionType).map((action) => (
                        <Icon
                            key={`home-${action}`}
                            type={action}
                            teamType="HOME"
                            teamColors={formData.homeColor}
                            onClick={() => setSelectedAction({type: action, team: formData.homeTeam})}
                        />
                    ))}
                </div>
                {/* Away Team Actions */}
                <div style={{display: 'flex', gap: '10px'}}>
                    {Object.values(ActionType).map((action) => (
                        <Icon
                            key={`away-${action}`}
                            type={action}
                            teamType="AWAY"
                            teamColors={formData.awayColor}
                            onClick={() => setSelectedAction({type: action, team: formData.awayTeam})}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const PlayerSelectorModal = () => (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 1000
        }}>
            <h3>Select Player</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                {selectedAction?.team.players.map((player) => (
                    <button
                        key={player.id}
                        onClick={() => {
                            const newAction: IGameAction = {
                                type: selectedAction?.type,
                                team: selectedAction?.team,
                                period,
                                time,
                                player: player as unknown as IPlayer,
                                x: selectedPosition!.x,
                                y: selectedPosition!.y
                            };

                            setActions([...actions, newAction]);
                            setSelectedAction(null);
                            setSelectedPosition(null);

                            if (selectedAction.type === ActionType.GOAL) {
                                if (selectedAction.team === formData.homeTeam) {
                                    const newHomeScore: IScoreData = {
                                        goals: homeScore.goals + 1,
                                        shots: homeScore.shots + 1,
                                        turnovers: homeScore.turnovers,
                                    }
                                    setHomeScore(newHomeScore)
                                } else {
                                    const newAwayScore: IScoreData = {
                                        goals: awayScore.goals + 1,
                                        shots: awayScore.shots + 1,
                                        turnovers: awayScore.turnovers,
                                    }
                                    setAwayScore(newAwayScore)
                                }
                            } else if (selectedAction.type === ActionType.SHOT) {
                                if (selectedAction.team === formData.homeTeam) {
                                    const newHomeScore: IScoreData = {
                                        goals: homeScore.goals,
                                        shots: homeScore.shots + 1,
                                        turnovers: homeScore.turnovers,
                                    }
                                    setHomeScore(newHomeScore)
                                } else {
                                    const newAwayScore: IScoreData = {
                                        goals: awayScore.goals,
                                        shots: awayScore.shots + 1,
                                        turnovers: awayScore.turnovers,
                                    }
                                    setAwayScore(newAwayScore)
                                }
                            } else if (selectedAction.type === ActionType.TURNOVER) {
                                if (selectedAction.team === formData.homeTeam) {
                                    const newHomeScore: IScoreData = {
                                        goals: homeScore.goals,
                                        shots: homeScore.shots,
                                        turnovers: homeScore.turnovers + 1,
                                    }
                                    setHomeScore(newHomeScore)
                                } else {
                                    const newAwayScore: IScoreData = {
                                        goals: awayScore.goals,
                                        shots: awayScore.shots,
                                        turnovers: awayScore.turnovers + 1,
                                    }
                                    setAwayScore(newAwayScore)
                                }
                            }
                        }}
                    >
                        {player.name} (#{player.jerseyNumber})
                    </button>
                ))}
            </div>
        </div>
    );


    const formData = useLocation().state.formData as FormData;
    const [showDetails, setShowDetails] = useState(true);
    const pressTimer = useRef<number | null>(null);
    const [isLongPress, setIsLongPress] = useState(false); // To track if it's a long press

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isLongPress) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setSelectedPosition({x, y});
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
        // Get existing games from localStorage
        /*const existingGamesRaw = localStorage.getItem('gameData');
        let games: IGame[] = [];

        if (existingGamesRaw) {
            try {
                games = JSON.parse(existingGamesRaw);
                // Ensure games is an array
                if (!Array.isArray(games)) {
                    games = [games];
                }
            } catch (e) {
                // If parsing fails, start with empty array
                console.warn('Failed to parse existing games, starting fresh');
                games = [];
            }
        }

        // Add new game record
        games.push(game);

        // Save back to localStorage
        localStorage.setItem('gameData', JSON.stringify(games));
        console.log(games)*/
        try {
            const newGame = await GameService.saveGame(game)
        } catch (e) {
            console.log(e)
        }
    }

    const submitGameHandler = (): void => {
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
        saveGameRecord(game);
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

    console.log(actions);

    const raw = localStorage.getItem("gameData")
    const data = JSON.parse(raw || '[]');
    console.log(data)

    return (
        <>
            {selectedPosition && !selectedAction && <ActionSelectorModal/>}
            {selectedAction && <PlayerSelectorModal/>}
            <div
                style={{width: '100%', position: 'relative'}}
                onClick={handleClick}
            >
                <img
                    src={formData.selectedImage}
                    alt="gamePage"
                    style={{width: '100%', display: 'block', cursor: 'pointer'}}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp} // Handle the case when the mouse leaves the image
                />
                {showDetails && actions.map((action, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: `${action.x * 100}%`,
                            top: `${action.y * 100}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <Icon
                            type={action.type}
                            teamType={action.team === formData.homeTeam ? 'HOME' : 'AWAY'}
                            teamColors={action.team === formData.homeTeam ? formData.homeColor : formData.awayColor}
                            size={30}
                        />
                    </div>
                ))}
            </div>
            {showDetails ? (
                <div>
                    <img src={formData.homeTeam.logo} alt={formData.homeTeam.name}/>
                    <div>
                        <p>Shots: {homeScore.shots}</p>
                        <p>Turnovers: {homeScore.turnovers}</p>
                    </div>

                    <div>
                        <p>Period: {period}</p>
                        <p>Time: {formatTime(time)}</p>
                        <p>Score: {homeScore.goals} - {awayScore.goals}</p>

                        {isTimerRunning ? (
                            <button onClick={() => setIsTimerRunning(false)}>Stop Time</button>
                        ) : (
                            time > 0 && <button onClick={() => setIsTimerRunning(true)}>Start Time</button>
                        )}

                        {!isTimerRunning && time === 0 && period < 3 && (
                            <button onClick={() => {
                                setPeriod(p => p + 1);
                                setTime(formData.gameType === GameType.REGULAR ? 5 : 5); // TODO: back to 1200
                            }}>Next Period</button>
                        )}

                        <button onClick={submitGameHandler}>End Game</button>
                    </div>

                    <div>
                        <p>Shots: {awayScore.shots}</p>
                        <p>Turnovers: {awayScore.turnovers}</p>
                    </div>
                    <img src={formData.awayTeam.logo} alt={formData.awayTeam.name}/>
                </div>
            ) : (
                <div>
                    <p>Period: {period}</p>
                    <p>Time: {formatTime(time)}</p>
                    <p>Score: {homeScore.goals} - {awayScore.goals}</p>

                    {isTimerRunning ? (
                        <button onClick={() => setIsTimerRunning(false)}>Stop Time</button>
                    ) : (
                        time > 0 && <button onClick={() => setIsTimerRunning(true)}>Start Time</button>
                    )}

                    {!isTimerRunning && time === 0 && period < 3 && (
                        <button onClick={() => {
                            setPeriod(p => p + 1);
                            setTime(formData.gameType === GameType.REGULAR ? 5 : 5); // TODO: back to 1200
                        }}>Next Period</button>
                    )}

                    <button onClick={submitGameHandler}>End Game</button>
                </div>
            )}
        </>
    );
};

export default GamePage;