import React from 'react';
import {IPlayer} from "../OOP/interfaces/IPlayer";

interface PlayerGameStatsTableProps {
    group: any;
    handleSort: (column: keyof IPlayer) => void;
    sortBy: keyof IPlayer;
    sortOrder: "asc" | "desc";
    selectedPlayer: string | null;
    setSelectedPlayer: (value: React.SetStateAction<string | null>) => void
}

const PlayerGameStatsTable = ({
                                  group,
                                  handleSort,
                                  sortBy,
                                  sortOrder,
                                  selectedPlayer,
                                  setSelectedPlayer
                              }: PlayerGameStatsTableProps) => {
    return (
        <div key={group.title}>
            <h4>{group.title}</h4>
            <div>
                <table>
                    <thead>
                    <tr>
                        {['name', 'jerseyNumber', 'goals', 'assists', 'points', 'shots', 'turnovers'].map((col) => (
                            <th key={col} onClick={() => handleSort(col as keyof IPlayer)}>
                                {col === 'jerseyNumber' ? 'Number' :
                                    col === 'name' ? 'Name' :
                                        col[0].toUpperCase() + col.slice(1)}
                                {sortBy === col && (<span>{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {group.players.map((player: any) => (
                        <tr
                            key={player.id}
                            onClick={() => {
                                if (selectedPlayer === player.id) {
                                    setSelectedPlayer(null);
                                } else {
                                    setSelectedPlayer(player.id);
                                }
                            }}
                        >
                            <td>{player.name}</td>
                            <td>{player.jerseyNumber}</td>
                            <td>{player.goals}</td>
                            <td>{player.shots}</td>
                            <td>{player.turnovers}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlayerGameStatsTable;