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
    handleIconClick: (action: IGameAction, e: React.MouseEvent,) => void
    handleMouseDown: () => void;
    handleMouseUp: () => void;
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchEnd: () => void;
}

const RinkWithIconsLive = ({
                               ref,
                               src,
                               showDetails,
                               gameState,
                               handleClick,
                               handleIconClick,
                               handleMouseDown,
                               handleMouseUp,
                               handleTouchStart,
                               handleTouchEnd
                           }: RinkWithIconsLiveProps) => {
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

            {showDetails && gameState.actions.map((action, index) => {
                const style = {
                    left: `${action.x * 100}%`,
                    top: `${action.y * 100}%`,
                    width: `30px`,
                    height: `30px`,
                    fontSize: `18px`
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