import React from 'react';
// @ts-ignore
import styles from './ScoreDisplay.module.css';

interface ScoreDisplayProps {
    homeScore: number;
    awayScore: number;
}

const ScoreDisplay = ({homeScore, awayScore}: ScoreDisplayProps) => (
    <div className={styles.score}>
        {homeScore} - {awayScore}
    </div>
);

export default ScoreDisplay;