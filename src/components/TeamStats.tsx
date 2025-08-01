import React from 'react';
// @ts-ignore
import styles from './TeamStats.module.css';

interface TeamStatsProps {
    team: {
        logo: string;
        name: string;
    };
    stats: {
        shots: number;
        turnovers: number;
    };
}

const TeamStats = ({ team, stats }: TeamStatsProps) => (
    <div className={styles.container}>
        <img src={team.logo} alt={team.name} className={styles.teamLogo} />
        <div className={styles.teamName}>{team.name}</div>
        <div className={styles.stats}>
            <p className={styles.statItem}>Shots: {stats.shots}</p>
            <p className={styles.statItem}>Turnovers: {stats.turnovers}</p>
        </div>
    </div>
);

export default TeamStats;