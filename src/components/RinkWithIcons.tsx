// RinkWithIcons.tsx
import React from 'react';
import {IGameAction} from "../OOP/interfaces/IGameAction";
// @ts-ignore
import styles from "./RinkWithIcons.module.css"

interface RinkWithIconsProps {
    imageRef: React.RefObject<HTMLImageElement>;
    src: string;
    filteredActions: IGameAction[];
    gameData: any;
    handleIconClick: (action: IGameAction, e: React.MouseEvent) => void;
    iconSize?: number;
}

const RinkWithIcons: React.FC<RinkWithIconsProps> = ({
                                                         imageRef,
                                                         src,
                                                         filteredActions,
                                                         gameData,
                                                         handleIconClick,
                                                         iconSize = 30
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
                const isHome = gameData.teams.home.id === action.team.id;
                const primaryColor = isHome ? action.team.homeColor.primary : action.team.awayColor.primary;
                const secondaryColor = isHome ? action.team.homeColor.secondary : action.team.awayColor.secondary;

                const style = {
                    left: `${action.x * 100}%`,
                    top: `${action.y * 100}%`,
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    fontSize: `${iconSize * 0.6}px`,
                    backgroundColor: primaryColor,
                    color: secondaryColor,
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

export default RinkWithIcons;