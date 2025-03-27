import React from 'react';
// @ts-ignore
import ReactSlider from 'react-slider';
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
    zoneFilter: { x: [number, number], y: [number, number] };
    setZoneFilter: (filter: { x: [number, number], y: [number, number] }) => void;
}

const GameVisualization: React.FC<GameVisualizationProps> = ({
                                                                 fieldImageRef,
                                                                 gameData,
                                                                 filteredActions,
                                                                 iconSize,
                                                                 handleIconClick,
                                                                 zoneFilter,
                                                                 setZoneFilter
                                                             }) => {
    return (
        <div className={styles.gameVisualization}>
            <img
                ref={fieldImageRef}
                src={gameData.selectedImage}
                alt="gamePage"
                className={styles.gameImage}
            />

            <div className={styles.visualGuides}>
                <div
                    className={`${styles.visualGuideLine} ${styles.horizontalGuide}`}
                    style={{top: `${zoneFilter.y[0]}%`}}
                />
                <div
                    className={`${styles.visualGuideLine} ${styles.horizontalGuide}`}
                    style={{top: `${zoneFilter.y[1]}%`}}
                />
                <div
                    className={`${styles.visualGuideLine} ${styles.verticalGuide}`}
                    style={{left: `${zoneFilter.x[0]}%`}}
                />
                <div
                    className={`${styles.visualGuideLine} ${styles.verticalGuide}`}
                    style={{left: `${zoneFilter.x[1]}%`}}
                />
            </div>

            {/* Horizontal (X-axis) Slider */}
            <div className={styles.sliderXContainer}>
                <ReactSlider
                    className={styles.horizontalSlider}
                    thumbClassName={styles.sliderThumb}
                    trackClassName={styles.sliderTrack}
                    value={zoneFilter.x}
                    onChange={(value: any) => setZoneFilter({...zoneFilter, x: value})}
                    min={0}
                    max={100}
                    pearling
                    minDistance={5}
                />
            </div>

            {/* Vertical (Y-axis) Slider */}
            <div className={styles.sliderYContainer}>
                <ReactSlider
                    className={styles.verticalSlider}
                    thumbClassName={styles.sliderThumb}
                    trackClassName={styles.sliderTrack}
                    value={zoneFilter.y}
                    onChange={(value: any) => setZoneFilter({...zoneFilter, y: value})}
                    min={0}
                    max={100}
                    pearling
                    minDistance={5}
                    orientation="vertical"
                />
            </div>

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