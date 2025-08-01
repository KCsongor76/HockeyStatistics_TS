import React from 'react';
import ScoreDisplay from "./ScoreDisplay";
import TeamStats from "./TeamStats";
import ITeamWithRoster from "../OOP/interfaces/ITeamWithRoster";
// @ts-ignore
import styles from "./GameStatsStatic.module.css"

interface GameStatsStaticProps {
    homeTeam: ITeamWithRoster;
    awayTeam: ITeamWithRoster;
    homeStats: {
        goals: number;
        shots: number;
        turnovers: number;
    };
    awayStats: {
        goals: number;
        shots: number;
        turnovers: number;
    }
}

const GameStatsStatic = ({homeTeam, awayTeam, homeStats, awayStats}: GameStatsStaticProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.teamStats}>
                <TeamStats team={homeTeam} stats={homeStats}/>
            </div>

            <div className={styles.score}>
                <ScoreDisplay homeScore={homeStats.goals} awayScore={awayStats.goals}/>
            </div>

            <div className={styles.teamStats}>
                <TeamStats team={awayTeam} stats={awayStats}/>
            </div>
        </div>
    );
};

export default GameStatsStatic;