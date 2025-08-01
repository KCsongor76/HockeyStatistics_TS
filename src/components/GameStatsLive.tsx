import React from 'react';
import {GameUtils} from "../OOP/classes/GameUtils";
import {CustomButton} from "./CustomButton";
import {GameState} from "../OOP/classes/GameState";
import TeamStats from "./TeamStats";
import PeriodTimeData from "./PeriodTimeData";
import {IGame} from "../OOP/interfaces/IGame";
// @ts-ignore
import styles from "./GameStatsLive.module.css"

interface GameStatsLiveProps {
    formData: any;
    gameState: GameState;
    gameData: IGame;
    setGameState: (value: React.SetStateAction<GameState>) => void;
    handleNextPeriod: any;
    submitGameHandler: any;
}

const GameStatsLive = ({
                           formData,
                           gameState,
                           gameData,
                           setGameState,
                           handleNextPeriod,
                           submitGameHandler
                       }: GameStatsLiveProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.teamStats}>
                <TeamStats team={formData.homeTeam} stats={gameState.homeScore}/>
            </div>

            <div className={styles.gameInfo}>
                <p>{gameData.season}</p>
                <p className={styles.period}>Period: {gameState.periodLabel}</p>
                <p className={styles.time}>
                    {gameState.periodLabel === "SO"
                        ? "0:00"
                        : GameUtils.formatTime(gameState.time)}
                </p>

                <CustomButton
                    type={'positive'}
                    onClick={submitGameHandler}
                >
                    Save Game
                </CustomButton>

                <PeriodTimeData
                    gameState={gameState}
                    setGameState={setGameState}
                    handleNextPeriod={handleNextPeriod}
                    submitGameHandler={submitGameHandler}
                />
            </div>

            <div className={styles.teamStats}>
                <TeamStats team={formData.awayTeam} stats={gameState.awayScore}/>
            </div>
        </div>
    );
};

export default GameStatsLive;