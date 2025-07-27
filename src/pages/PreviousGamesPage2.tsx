import React, {useEffect, useState} from 'react';
import {GameService} from "../OOP/services/GameService";
import {ChampionshipService} from "../OOP/services/ChampionshipService";
import {TeamService} from "../OOP/services/TeamService";
import {Game} from "../OOP/classes/Game";
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {GameType} from "../OOP/enums/GameType";
import {useNavigate} from "react-router-dom";
import {Season} from "../OOP/enums/Season";

interface PreviousGamesPageProps {
    playerGames?: Game[];
    showFilters?: boolean;
}

const PreviousGamesPage2: React.FC<PreviousGamesPageProps> = ({playerGames, showFilters = true}) => {
    const [games, setGames] = useState<Game[]>([]);
    const [championships, setChampionships] = useState<Championship[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [homeTeamFilter, setHomeTeamFilter] = useState('');
    const [awayTeamFilter, setAwayTeamFilter] = useState('');
    const [championshipFilter, setChampionshipFilter] = useState('');
    const [gameTypeFilter, setGameTypeFilter] = useState('');
    const seasons = Object.values(Season);
    const [seasonFilter, setSeasonFilter] = useState<Season | "">("");
    const [sortOrder, setSortOrder] = useState('newest');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);


    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [championshipsData, teamsData, gamesData] = await Promise.all([
                    ChampionshipService.getAllChampionships(),
                    TeamService.getAllTeams() as Promise<Team[]>,
                    playerGames || GameService.getAllGames()
                ]);

                setChampionships(championshipsData.map(c => Championship.fromPlain(c)));
                setTeams(teamsData);
                setGames(gamesData.map(g => Game.fromPlain(g)));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredGames = games.filter(game => {
        return (
            (!homeTeamFilter || game.homeTeam.id === homeTeamFilter) &&
            (!awayTeamFilter || game.awayTeam.id === awayTeamFilter) &&
            (!championshipFilter || game.championship.id === championshipFilter) &&
            (!gameTypeFilter || game.type === gameTypeFilter) &&
            (!seasonFilter || game.season === seasonFilter)
        );
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

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    if (loading) return <div>Loading...</div>;
    if (games.length === 0) return <div>No games found.</div>;

    return (
        <div>
            <h1>Previous Games</h1>

            {showFilters && (
                <div>
                    <select
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
                        value={seasonFilter}
                        onChange={(e) => setSeasonFilter(e.target.value as Season || "")}
                    >
                        <option value="">All Seasons</option>
                        {seasons.map(season => (
                            <option key={season} value={season}>
                                {season}
                            </option>
                        ))}
                    </select>

                    <select
                        value={gameTypeFilter}
                        onChange={(e) => setGameTypeFilter(e.target.value)}
                    >
                        <option value="">All types</option>
                        <option value={GameType.REGULAR}>{GameType.REGULAR}</option>
                        <option value={GameType.PLAYOFF}>{GameType.PLAYOFF}</option>
                    </select>

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>

                    <select
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
            )}

            <div>
                <ul>
                    {currentGames.length > 0 ? (
                        currentGames.map((game) => {
                            const season = game.season || 'Not Specified';

                            return (
                                <li
                                    key={game.id}
                                    onClick={() => navigate(`/previous_games/${game.id}`, {state: game})}
                                >
                                    <div>
                                        <div>
                                            <img
                                                src={game.homeTeam.logo}
                                                alt={game.homeTeam.name}
                                            />
                                            <span>{game.homeTeam.name}</span>
                                        </div>

                                        <div>
                                            {game.homeScore} - {game.awayScore}
                                        </div>

                                        <div>
                                            <img
                                                src={game.awayTeam.logo}
                                                alt={game.awayTeam.name}
                                            />
                                            <span>{game.awayTeam.name}</span>
                                        </div>

                                        <div>
                                            {formatDate(game.timestamp)}
                                        </div>

                                        <p>Type: {game.type}</p>
                                        <p>Season: {season}</p>
                                        <p>Championship: {game.championship.name}</p>
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <p>No games found.</p>
                    )}
                </ul>
            </div>

            <div>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PreviousGamesPage2;