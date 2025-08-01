import React from 'react';
import PlayerGameStatsTable from "./PlayerGameStatsTable";
import {IPlayer} from "../OOP/interfaces/IPlayer";
// @ts-ignore
import styles from "./PlayerStatsSection.module.css"

interface PlayerStatsSectionProps {
    positionGroups: any;
    handleSort: (column: keyof IPlayer) => void;
    sortBy: keyof IPlayer;
    sortOrder: "asc" | "desc";
    selectedPlayer: string | null;
    setSelectedPlayer: (value: React.SetStateAction<string | null>) => void
    uniqueNonRoster: IPlayer[];
    playerStats: IPlayer[];
}

const PlayerStatsSection = ({
                                positionGroups,
                                handleSort,
                                sortBy,
                                sortOrder,
                                selectedPlayer,
                                setSelectedPlayer,
                                uniqueNonRoster,
                                playerStats
                            }: PlayerStatsSectionProps) => {
    const sortedPlayers = [...playerStats].sort((a, b) => {
        let compareValue = 0;
        if (sortBy === 'name' || sortBy === 'position') {
            compareValue = a[sortBy].localeCompare(b[sortBy]);
        } else if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
            compareValue = (a[sortBy] as number) - (b[sortBy] as number);
        }
        return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    const goalies = sortedPlayers.filter(player => player.position === 'Goalie');
    const defenders = sortedPlayers.filter(player => player.position === 'Defender');
    const forwards = sortedPlayers.filter(player => player.position === 'Forward');
    const sortedPositionGroups = [
        {title: 'Goalies', players: goalies},
        {title: 'Defenders', players: defenders},
        {title: 'Forwards', players: forwards}
    ];

    return (
        <div className={styles.container}>
            <h3>Player Statistics</h3>
            {sortedPositionGroups.map((group: any) => (
                group.players.length > 0 && (
                    <PlayerGameStatsTable
                        key={group.title}
                        group={group}
                        handleSort={handleSort}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        selectedPlayer={selectedPlayer}
                        setSelectedPlayer={setSelectedPlayer}
                    />
                )
            ))}

            {uniqueNonRoster.length > 0 && (
                <>
                    <h4>Non-Roster Players</h4>
                    <ul className={styles.nonRosterList}>
                        {uniqueNonRoster.map(player => (
                            <li key={player.id}>
                                {player.name} (#{player.jerseyNumber})
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default PlayerStatsSection;