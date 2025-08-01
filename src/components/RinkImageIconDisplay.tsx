import React from 'react';
import {IGameAction} from "../OOP/interfaces/IGameAction";
// @ts-ignore
import styles from "./RinkImageIconDisplay.module.css"

interface RinkImageIconDisplayProps {
    imageRef: React.RefObject<HTMLImageElement>;
    src: string;
    filteredActions: IGameAction[];
    handleIconClick: (action: IGameAction, e: React.MouseEvent<Element, MouseEvent>) => void;
    iconSize?: number;
    className?: string;
}

const RinkImageIconDisplay: React.FC<RinkImageIconDisplayProps> = ({
                                                                       imageRef,
                                                                       src,
                                                                       filteredActions,
                                                                       handleIconClick,
                                                                       iconSize = 30,
                                                                       className = ''
                                                                   }) => {
    return (
        <div className={styles.container}>
            <img
                ref={imageRef}
                src={src}
                alt="Rink"
                className={styles.rinkImage}
            />
            {filteredActions.map((action, index) => {
                const style = {
                    left: `${action.x * 100}%`,
                    top: `${action.y * 100}%`,
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    fontSize: `${iconSize * 0.6}px`
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

export default RinkImageIconDisplay;