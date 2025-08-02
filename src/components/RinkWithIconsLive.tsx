import React from 'react';
import {GameState} from "../OOP/classes/GameState";
import {IGameAction} from "../OOP/interfaces/IGameAction";
// @ts-ignore
import styles from "./RinkWithIconsLive.module.css"

interface RinkWithIconsLiveProps {
    ref: React.RefObject<HTMLImageElement>;
    src: string;
    showDetails: boolean;
    gameState: GameState;
    handleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    setSelectedActionDetails: (value: React.SetStateAction<IGameAction | null>) => void
    setIsModalOpen: (value: React.SetStateAction<boolean>) => void;
    setIsLongPress: (value: React.SetStateAction<boolean>) => void;
    pressTimer: React.MutableRefObject<number | null>;
    setShowDetails: (value: React.SetStateAction<boolean>) => void;
}

const RinkWithIconsLive = ({
                               ref,
                               src,
                               showDetails,
                               gameState,
                               handleClick,
                               setSelectedActionDetails,
                               setIsModalOpen,
                               setIsLongPress,
                               pressTimer,
                               setShowDetails
                           }: RinkWithIconsLiveProps) => {

    const handleIconClick = (action: IGameAction, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedActionDetails(action);
        setIsModalOpen(true);
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


    return (
        <div
            className={styles.container}
            onClick={handleClick}
        >
            <img
                ref={ref}
                src={src}
                alt="gamePage"
                className={styles.rinkImage}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            />

            {showDetails && gameState.actions.map((action: IGameAction, index: React.Key | null | undefined) => {
                const style = {
                    left: `${action.x * 100}%`,
                    top: `${action.y * 100}%`,
                    width: `30px`,
                    height: `30px`,
                    fontSize: `18px`,
                };

                return (
                    <div
                        key={index}
                        className={`${styles.icon} ${styles[action.type.toLowerCase()]}`}
                        style={style}
                        onClick={(e) => handleIconClick(action, e)}
                    >
                        {action.type[0]}
                    </div>
                );
            })}
        </div>
    );
};

export default RinkWithIconsLive;