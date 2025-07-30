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
import {Select} from "../components/CRUD/Select";
import Pagination from "../components/Pagination";
import GameListItem from "../components/GameListItem";

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
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10
    });

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

    const indexOfLastGame = pagination.page * pagination.perPage;
    const indexOfFirstGame = indexOfLastGame - pagination.perPage;
    const currentGames = sortedGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(sortedGames.length / pagination.perPage);

    if (loading) return <div>Loading...</div>;
    if (games.length === 0) return <div>No games found.</div>;

    return (
        <div>
            <h1>Previous Games</h1>

            {showFilters && (
                <div>
                    <Select
                        value={homeTeamFilter}
                        options={teams.map(team => ({value: team.id, label: team.name}))}
                        onChange={setHomeTeamFilter}
                        allLabel={"All Home Teams"}
                    />

                    <Select
                        value={awayTeamFilter}
                        options={teams.map(team => ({value: team.id, label: team.name}))}
                        onChange={setAwayTeamFilter}
                        allLabel={"All Away Teams"}
                    />

                    <Select
                        value={championshipFilter}
                        options={championships.map(c => ({value: c.id, label: c.name}))}
                        onChange={setChampionshipFilter}
                        allLabel={"All Championships"}
                    />

                    <Select
                        value={seasonFilter}
                        options={seasons.map(s => ({value: s, label: s}))}
                        onChange={(s) => setSeasonFilter(s as Season || "")}
                        allLabel={"All Seasons"}
                    />

                    <Select
                        value={gameTypeFilter}
                        options={Object.values(GameType).map(gt => ({value: gt, label: gt}))}
                        onChange={setGameTypeFilter}
                        allLabel={"All Gametypes"}
                    />

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            )}

            <div>
                <ul>
                    {currentGames.length > 0 ? (
                        currentGames.map((game) => <GameListItem key={game.id} game={game}/>)
                    ) : (
                        <p>No games found.</p>
                    )}
                </ul>
            </div>

            <Pagination
                pagination={pagination}
                totalPages={totalPages}
                setPagination={setPagination}
            />
        </div>
    );
};

export default PreviousGamesPage2;