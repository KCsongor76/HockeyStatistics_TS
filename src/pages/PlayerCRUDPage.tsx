import React, {useState, useEffect} from 'react';
import {useLoaderData, useNavigate} from "react-router-dom";
import {PlayerService} from "../OOP/services/PlayerService";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './PlayerCRUDPage.module.css';
import {Position} from "../OOP/enums/Position";
import {IPlayer} from "../OOP/interfaces/IPlayer";

type LoaderData = {
    players: { player: IPlayer, teamName: string }[];
    teams: any[];
};

const PlayerCRUDPage = () => {
    console.log("page");
    const loaderData = useLoaderData() as LoaderData;
    const navigate = useNavigate();

    // Initialize with empty arrays and update when loaderData is available
    const [playersWithTeamNames, setPlayersWithTeamNames] = useState<{ player: IPlayer, teamName: string }[]>([]);
    const [teams, setTeams] = useState<any[]>([]);

    // Use useEffect to safely update state when loaderData is available
    useEffect(() => {
        if (loaderData) {
            setPlayersWithTeamNames(loaderData.players || []);
            setTeams(loaderData.teams || []);
        }
    }, [loaderData]);

    // New state variables
    const [teamFilter, setTeamFilter] = useState('');
    const [positionFilter, setPositionFilter] = useState('');
    const [jerseyNrFilter, setJerseyNrFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredPlayers = playersWithTeamNames.filter(({player, teamName}) => {
        const matchesTeam = teamFilter ? player.teamId === teamFilter : true;
        const matchesPosition = positionFilter ? player.position === positionFilter : true;
        const matchesJersey = jerseyNrFilter ? player.jerseyNumber.toString().includes(jerseyNrFilter) : true;
        const matchesSearch = searchQuery ? player.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
        return matchesTeam && matchesPosition && matchesJersey && matchesSearch;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPlayers = filteredPlayers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);

    const deleteHandler = async (player: IPlayer) => {
        if (window.confirm("Are you sure you want to delete this player?")) {
            try {
                await PlayerService.deletePlayer(player.teamId, player.id);
                setPlayersWithTeamNames(prev => prev.filter(p => p.player.id !== player.id));
            } catch (error) {
                alert("Failed to delete player");
            }
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.createButton} onClick={() => navigate("create")}>
                Create New Player
            </button>

            <div className={styles.filterContainer}>
                <input
                    type="text"
                    placeholder="Search name..."
                    className={styles.filterInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                    className={styles.filterInput}
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                >
                    <option value="">All Teams</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.filterInput}
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                >
                    <option value="">All Positions</option>
                    <option value={Position.GOALIE}>{Position.GOALIE}</option>
                    <option value={Position.FORWARD}>{Position.FORWARD}</option>
                    <option value={Position.DEFENDER}>{Position.DEFENDER}</option>
                </select>

                <input
                    type="number"
                    placeholder="Jersey Number"
                    className={styles.filterInput}
                    value={jerseyNrFilter}
                    onChange={(e) => setJerseyNrFilter(e.target.value)}
                />

                <select
                    className={styles.filterInput}
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                </select>
            </div>

            <div className={styles.playerList}>
                {currentPlayers.map(({player, teamName}) => (
                    <div key={player.id} className={styles.playerItem}>
                        <div className={styles.playerHeader}>
                            <div className={styles.playerName}>{player.name}</div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>#</span>
                                {player.jerseyNumber}
                            </div>
                        </div>

                        <div className={styles.playerDetails}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Position:</span>
                                {player.position}
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Team:</span>
                                {teamName}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.viewButton}
                                onClick={() => navigate(`${player.id}`, {state: {player}})}
                            >
                                View
                            </button>
                            <button
                                className={styles.deleteButton}
                                onClick={() => deleteHandler(player)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.paginationContainer}>
                <button
                    className={styles.paginationButton}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages || 1}</span>
                <button
                    className={styles.paginationButton}
                    onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
                    disabled={currentPage >= (totalPages || 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PlayerCRUDPage;

export const loader = async () => {
    try {
        // Parallelize initial data fetching
        const [players, teams] = await Promise.all([
            PlayerService.getAllPlayers(),
            TeamService.getAllTeams()
        ]);

        // Create team lookup map (O(1) access)
        const teamMap = new Map(teams.map(team => [team.id, team]));

        // Process players in-memory (no async operations)
        const playersWithTeams = players.map(player => ({
            player,
            teamName: teamMap.get(player.teamId)?.name || "Unknown Team"
        }));

        return {
            players: playersWithTeams,
            teams
        };
    } catch (error) {
        console.error("Error in loader:", error);
        return {players: [], teams: []};
    }
};