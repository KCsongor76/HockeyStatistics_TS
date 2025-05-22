import React, { useRef } from 'react';
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';
import Icon from '../components/Icon';
import { IGame } from '../OOP/interfaces/IGame';
import { IGameAction } from '../OOP/interfaces/IGameAction';

interface GameVisualizationProps {
    gameData: IGame;
    filteredActions: IGameAction[];
    iconSize: number;
    handleIconClick: (action: IGameAction) => void;
}

const GameVisualization = ({
                               gameData,
                               filteredActions,
                               iconSize,
                               handleIconClick
                           }: GameVisualizationProps) => {
    const fieldImageRef = useRef<HTMLImageElement>(null);

    return (
        <div className={styles.gameVisualization}>
            <img
                ref={fieldImageRef}
                src={gameData.selectedImage}
                alt="gamePage"
                className={styles.gameImage}
            />
            {filteredActions.map((action, index) => (
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
                        teamColors={
                            action.team.id === gameData.teams.home.id
                                ? gameData.teams.home.homeColor
                                : gameData.teams.away.homeColor
                        }
                        size={iconSize}
                        onClick={() => handleIconClick(action)}
                    />
                </div>
            ))}
        </div>
    );
};

export default GameVisualization;