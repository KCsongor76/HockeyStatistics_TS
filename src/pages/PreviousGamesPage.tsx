import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
// @ts-ignore
import styles from './PreviousGamesPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";
import {GameService} from "../OOP/services/GameService";
import {ChampionshipService} from "../OOP/services/ChampionshipService";
import {TeamService} from "../OOP/services/TeamService";
import {ITeam} from "../OOP/interfaces/ITeam";
import {IChampionship} from "../OOP/interfaces/IChampionship";

// todo: make smaller components
// todo: scrap styling, unify

interface PreviousGamesPageProps {
    playerGames?: IGame[];
    showFilters?: boolean;
}

const PreviousGamesPage: React.FC<PreviousGamesPageProps> = ({playerGames: playerGames, showFilters = true}) => {
    const [games, setGames] = useState<IGame[]>([]);
    const [championships, setChampionships] = useState<IChampionship[]>([]);
    const [teams, setTeams] = useState<ITeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [homeTeamFilter, setHomeTeamFilter] = useState('');
    const [awayTeamFilter, setAwayTeamFilter] = useState('');
    const [championshipFilter, setChampionshipFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await GameService.getAllGames();
                if (playerGames) {
                    setGames(playerGames);
                } else {
                    setGames(gamesData);
                }
            } catch (error) {
                console.error("Error fetching games:", error);
            }
        };

        const fetchChampionships = async () => {
            try {
                const championships = await ChampionshipService.getAllChampionships();
                setChampionships(championships);
            } catch (error) {
                console.error("Error fetching championships:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchTeams = async () => {
            try {
                const teams = await TeamService.getAllTeams() as unknown as ITeam[];
                setTeams(teams);
            } catch (error) {
                console.error("Error fetching teams:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChampionships();
        fetchTeams();
        fetchGames();
    }, []);

    const filteredGames = games.filter(game => {
        const homeMatch = homeTeamFilter ? game.teams.home.id === homeTeamFilter : true;
        const awayMatch = awayTeamFilter ? game.teams.away.id === awayTeamFilter : true;
        const championshipMatch = championshipFilter ? game.championship.id === championshipFilter : true;
        return homeMatch && awayMatch && championshipMatch;
    });

    const sortedGames = [...filteredGames].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const indexOfLastGame = currentPage * itemsPerPage;
    const indexOfFirstGame = indexOfLastGame - itemsPerPage;
    const currentGames = sortedGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(sortedGames.length / itemsPerPage);

    if (loading) {
        return <div className={styles.container}>Loading...</div>;
    }

    if (games.length === 0) {
        return <div className={styles.container}>No games found.</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Previous Games</h1>

            {showFilters && (
                <div className={styles.controlsContainer}>
                    {/* ... existing filter controls ... */}
                </div>
            )}

            <div className={styles.controlsContainer}>
                <select
                    className={styles.selectFilter}
                    value={homeTeamFilter}
                    onChange={(e) => setHomeTeamFilter(e.target.value)}
                >
                    <option value="">All Home Teams</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.selectFilter}
                    value={awayTeamFilter}
                    onChange={(e) => setAwayTeamFilter(e.target.value)}
                >
                    <option value="">All Away Teams</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.selectFilter}
                    value={championshipFilter}
                    onChange={(e) => setChampionshipFilter(e.target.value)}
                >
                    <option value="">All Championships</option>
                    {championships.map(championship => (
                        <option key={championship.id} value={championship.id}>
                            {championship.name}
                        </option>
                    ))}
                </select>

                <select
                    className={styles.selectFilter}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>

                <select
                    className={styles.selectFilter}
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={75}>75 per page</option>
                    <option value={100}>100 per page</option>
                </select>
            </div>

            <div className={styles.listContainer}>
                <ul className={styles.list}>
                    {currentGames.length > 0 ? currentGames.map((game: IGame, index: number) => (
                        <li
                            className={styles.listItem}
                            key={game.id || index}
                            onClick={() => navigate(`/previous_games/${game.id}`, {state: game})}
                        >
                            <div className={styles.gameContent}>
                                <div className={styles.teamSection}>
                                    <img className={styles.teamLogo}
                                         src={game.teams.home.logo}
                                         alt={game.teams.home.name}/>
                                    <span>{game.teams.home.name}</span>
                                </div>

                                <div className={styles.scoreSection}>
                                    {game.score.home.goals} - {game.score.away.goals}
                                </div>

                                <div className={styles.teamSection}>
                                    <img className={styles.teamLogo}
                                         src={game.teams.away.logo}
                                         alt={game.teams.away.name}/>
                                    <span>{game.teams.away.name}</span>
                                </div>

                                <div className={styles.dateSection}>
                                    {formatTime(game.timestamp)}
                                </div>
                            </div>
                        </li>
                    )) : <p>No games found.</p>}
                </ul>
            </div>

            <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '1rem'
            }}>
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PreviousGamesPage;