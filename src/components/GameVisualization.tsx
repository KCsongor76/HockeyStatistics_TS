import React from 'react';
import {IGameAction} from "../OOP/interfaces/IGameAction";
import {IGame} from "../OOP/interfaces/IGame";
import Icon from "./Icon";
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';

interface GameVisualizationProps {
    fieldImageRef: React.RefObject<HTMLImageElement>;
    gameData: IGame;
    filteredActions: IGameAction[];
    iconSize: number;
    handleIconClick: (action: IGameAction) => void;
}

const GameVisualization: React.FC<GameVisualizationProps> = ({
    fieldImageRef,
    gameData,
    filteredActions,
    iconSize,
    handleIconClick
}) => {
    return (
        <div className={styles.gameVisualization}>
            <img
                ref={fieldImageRef}
                src={gameData.selectedImage}
                alt="gamePage"
                className={styles.gameImage}
            />
            {filteredActions.map((action: IGameAction, index: number) => (
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
                        teamType={action.team.id === gameData.teams.home.id ? 'HOME' : 'AWAY'}
                        teamColors={action.team.id === gameData.teams.home.id ? gameData.teams.home.homeColor : gameData.teams.away.homeColor}
                        size={iconSize}
                        onClick={() => handleIconClick(action)}
                    />
                </div>
            ))}
        </div>
    );
};

export default GameVisualization; 