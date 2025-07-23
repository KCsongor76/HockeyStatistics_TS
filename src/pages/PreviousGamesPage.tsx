import React, {useEffect, useState} from 'react';
// @ts-ignore
import styles from './PreviousGamesPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";
import {GameService} from "../OOP/services/GameService";
import {ChampionshipService} from "../OOP/services/ChampionshipService";
import {TeamService} from "../OOP/services/TeamService";
import {ITeam} from "../OOP/interfaces/ITeam";
import {IChampionship} from "../OOP/interfaces/IChampionship";
import FilterControls from '../components/FilterControls';
import GameListItem from '../components/GameListItem';
import Pagination from '../components/Pagination';

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
    const [gameTypeFilter, setGameTypeFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

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
        const homeMatch = homeTeamFilter ? game.teams?.home.id === homeTeamFilter : true;
        const awayMatch = awayTeamFilter ? game.teams?.away.id === awayTeamFilter : true;
        const championshipMatch = championshipFilter ? game.championship.id === championshipFilter : true;
        const gameTypeMatch = gameTypeFilter ? game.type === gameTypeFilter : true;
        return homeMatch && awayMatch && championshipMatch && gameTypeMatch;
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

    if (loading) return <div className={styles.container}>Loading...</div>;
    if (games.length === 0) return <div className={styles.container}>No games found.</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Previous Games</h1>

            {showFilters && (
                <FilterControls
                    teams={teams}
                    championships={championships}
                    homeTeamFilter={homeTeamFilter}
                    awayTeamFilter={awayTeamFilter}
                    championshipFilter={championshipFilter}
                    gameTypeFilter={gameTypeFilter}
                    sortOrder={sortOrder}
                    itemsPerPage={itemsPerPage}
                    onHomeTeamChange={setHomeTeamFilter}
                    onAwayTeamChange={setAwayTeamFilter}
                    onChampionshipChange={setChampionshipFilter}
                    onGameTypeChange={setGameTypeFilter}
                    onSortOrderChange={setSortOrder}
                    onItemsPerPageChange={(value) => {
                        setItemsPerPage(value);
                        setCurrentPage(1);
                    }}
                />
            )}

            <div className={styles.listContainer}>
                <ul className={styles.list}>
                    {currentGames.length > 0 ?
                        currentGames.map((game, index) => (
                            <GameListItem key={game.id || index} game={game} index={index}/>
                        )) :
                        <p>No games found.</p>
                    }
                </ul>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default PreviousGamesPage;