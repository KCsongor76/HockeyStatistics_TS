import React from 'react';
import ScoreDisplay from "./ScoreDisplay";
import TeamStats from "./TeamStats";
import ITeamWithRoster from "../OOP/interfaces/ITeamWithRoster";

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
    return <div>
        <TeamStats team={homeTeam} stats={homeStats}/>
        <ScoreDisplay homeScore={homeStats.goals} awayScore={awayStats.goals}/>
        <TeamStats team={awayTeam} stats={awayStats}/>
    </div>
};

export default GameStatsStatic;