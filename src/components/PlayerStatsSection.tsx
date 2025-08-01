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
}

const PlayerStatsSection = ({
                                positionGroups,
                                handleSort,
                                sortBy,
                                sortOrder,
                                selectedPlayer,
                                setSelectedPlayer,
                                uniqueNonRoster
                            }: PlayerStatsSectionProps) => {
    return (
        <div className={styles.container}>
            <h3>Player Statistics</h3>
            {positionGroups.map((group: any) => (
                group.players.length > 0 && (
                    <PlayerGameStatsTable
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