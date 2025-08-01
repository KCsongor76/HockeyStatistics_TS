import React from 'react';
import {CustomButton} from "./CustomButton";
import {GameState} from "../OOP/classes/GameState";
// @ts-ignore
import styles from "./PeriodTimeData.module.css"

interface PeriodTimeDataProps {
    gameState: GameState;
    setGameState: (value: React.SetStateAction<GameState>) => void;
    handleNextPeriod: any;
    submitGameHandler: any;
}

const PeriodTimeData = ({gameState, setGameState, handleNextPeriod, submitGameHandler}: PeriodTimeDataProps) => {
    return (
        <div className={styles.container}>
            {!gameState.isGameOver && (
                gameState.isTimerRunning ? (
                    <CustomButton
                        type={'negative'}
                        onClick={() => setGameState(prev => new GameState({
                            ...prev,
                            isTimerRunning: false
                        }))}
                    >
                        Stop Time
                    </CustomButton>
                ) : (
                    gameState.time > 0 &&
                    <CustomButton
                        type={'positive'}
                        onClick={() => setGameState(prev => new GameState({
                            ...prev,
                            isTimerRunning: true
                        }))}
                    >
                        Start Time
                    </CustomButton>
                )
            )}

            {!gameState.isTimerRunning && gameState.time === 0 && !gameState.isGameOver && (
                <CustomButton
                    type={'neutral'}
                    onClick={handleNextPeriod}
                >
                    Next Period
                </CustomButton>
            )}

            <CustomButton
                type={'positive'}
                onClick={submitGameHandler}
            >
                Save Game
            </CustomButton>
        </div>
    );
};

export default PeriodTimeData;