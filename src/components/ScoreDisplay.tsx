import React from 'react';
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';

interface ScoreDisplayProps {
    homeScore: number;
    awayScore: number;
}

const ScoreDisplay = ({ homeScore, awayScore }: ScoreDisplayProps) => (
    <div className={styles.gameControls}>
        <p className={styles.scoreDisplay}>{homeScore} - {awayScore}</p>
    </div>
);

export default ScoreDisplay;