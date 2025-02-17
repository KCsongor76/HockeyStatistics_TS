import React, {useRef, useState} from 'react';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {GameType} from "../OOP/enums/GameType";
import {TeamColor} from "../OOP/interfaces/TeamColor";
import {useLocation} from "react-router-dom";

type FormData = {
    championship: Championship;
    homeTeam: Team;
    awayTeam: Team;
    gameType: GameType;
    homeColor: TeamColor;
    awayColor: TeamColor;
    imageOption: {
        rinkUp: string;
        rinkDown: string;
    };
    selectedImage: string;
};

const GamePage = () => {
    const formData = useLocation().state.formData as FormData;
    const [showDetails, setShowDetails] = useState(true);
    const pressTimer = useRef<number | null>(null);
    const [isLongPress, setIsLongPress] = useState(false); // To track if it's a long press

    const [events, setEvents] = useState<{ x: number, y: number, type: string }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // If it's a long press, do not execute the click logic
        if (isLongPress) {
            setIsLongPress(false); // Reset long press state
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const eventType = 'goal'; // Placeholder event type
        setEvents([...events, {x, y, type: eventType}]);
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

    return (
        <>
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
                {events.map((event, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: `${event.x * 100}%`,
                            top: `${event.y * 100}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        🏒
                    </div>
                ))}
            </div>
            {showDetails ? (
                <div>
                    <img src={formData.homeTeam.logo} alt={formData.homeTeam.name}/>
                    <div>
                        <p>Shots: </p>
                        <p>Turnovers: </p>
                    </div>

                    <div>
                        <p>Period: </p>
                        <p>Time: </p>
                        <p>Score: </p>
                        {false && <button>Stop time</button>}
                        {true && <button>Start time</button>}
                        {true && <button>Next period</button>}
                        {true && <button>End game</button>}
                    </div>

                    <div>
                        <p>Shots: </p>
                        <p>Turnovers: </p>
                    </div>
                    <img src={formData.awayTeam.logo} alt={formData.awayTeam.name}/>
                </div>
            ) : (
                <div>
                    <p>Period: </p>
                    <p>Time: </p>
                    <p>Score: </p>
                    {false && <button>Stop time</button>}
                    {true && <button>Start time</button>}
                    {true && <button>Next period</button>}
                    {true && <button>End game</button>}
                </div>
            )}
        </>
    );
};

export default GamePage;
