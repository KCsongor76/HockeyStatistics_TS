import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './HandleTeamPage.module.css';
import {ITeam} from "../OOP/interfaces/ITeam";
import {GameService} from "../OOP/services/GameService";
import {IGame} from "../OOP/interfaces/IGame";
import PreviousGamesPage from "./PreviousGamesPage";
import {GameType} from "../OOP/enums/GameType";

// todo: edit team: unify styling with start page

interface TeamStats {
    gamesPlayed: number;
    wins: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    shots: number;
    turnovers: number;
    shootingPercentage: number;
}

const HandleTeamPage = () => {
    const location = useLocation();
    const initialTeam = location.state.team as ITeam;
    const [team, setTeam] = useState(initialTeam);
    const [name, setName] = useState(initialTeam.name);
    const [logo, setLogo] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [games, setGames] = useState<IGame[]>([]);
    const [showPlayers, setShowPlayers] = useState(false);
    const [showGames, setShowGames] = useState(false);

    const navigate = useNavigate();

    const goBackHandler = () => {
        navigate("/handleTeams");
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only .jpg and .png formats are allowed.');
                const fileInput = document.getElementById("logo") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
                return;
            }

            // Check file size (10MB in bytes)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert('File size should not exceed 10MB.');
                const fileInput = document.getElementById("logo") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
                return;
            }

            // If valid, set the logo
            setLogo(file);
        }
    };

    const handleSave = async () => {
        try {
            let logoURL = team.logo; // Use existing logo URL if no new file is uploaded

            if (logo) {
                // If a new logo file is uploaded, upload it and get the new URL
                logoURL = await TeamService.uploadLogo(logo);
            }

            // const updatedTeam = new Team(team.id, name, logoURL, team.homeColor, team.awayColor, team.championships, team.players);
            const updatedTeam = {
                id: team.id,
                name: name,
                logo: logoURL,
                homeColor: team.homeColor,
                awayColor: team.awayColor,
                championships: team.championships,
                players: team.players,
            } as ITeam;
            console.log(updatedTeam);
            await TeamService.updateTeam(updatedTeam.id, updatedTeam);
            setTeam(updatedTeam);
            setIsEditing(false); // Disable editing after saving
        } catch (error) {
            console.error("Error updating team:", error);
            alert("Something went wrong");
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    function handleDiscard() {
        setTeam(initialTeam);
        setIsEditing(false);
    }

    const calculateStats = (games: IGame[]): TeamStats => {
        let stats: TeamStats = {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            shots: 0,
            turnovers: 0,
            shootingPercentage: 0
        };

        games.forEach(game => {
            const isHomeTeam = game.teams.home.id === team.id;
            const teamSide = isHomeTeam ? 'home' : 'away';
            const opponentSide = isHomeTeam ? 'away' : 'home';

            stats.gamesPlayed++;
            stats.goalsFor += game.score[teamSide].goals;
            stats.goalsAgainst += game.score[opponentSide].goals;
            stats.shots += game.score[teamSide].shots;
            stats.turnovers += game.score[teamSide].turnovers;

            // Determine win/loss
            if (game.score[teamSide].goals > game.score[opponentSide].goals) {
                stats.wins++;
            } else {
                stats.losses++;
            }
        });

        stats.shootingPercentage = stats.shots > 0
            ? (stats.goalsFor / stats.shots) * 100
            : 0;

        return stats;
    };

    const teamGames = games.filter(game =>
        game.teams?.home.id === team.id ||
        game.teams?.away.id === team.id
    );

    const regularSeasonGames = teamGames.filter(game => game.type === GameType.REGULAR);
    const playoffGames = teamGames.filter(game => game.type === GameType.PLAYOFF);

    const regularStats = calculateStats(regularSeasonGames);
    const playoffStats = calculateStats(playoffGames);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await GameService.getAllGames();
                setGames(gamesData);
            } catch (error) {
                console.error("Error fetching games:", error);
            }
        };
        fetchGames();
    }, []);


    const StatsTable: React.FC<{ stats: TeamStats }> = ({ stats }) => (
        <div className={styles.tableContainer}>
            <table>
                <thead>
                <tr>
                    <th>GP</th>
                    <th>W</th>
                    <th>L</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>Shots</th>
                    <th>TO</th>
                    <th>SH%</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{stats.gamesPlayed}</td>
                    <td>{stats.wins}</td>
                    <td>{stats.losses}</td>
                    <td>{stats.goalsFor}</td>
                    <td>{stats.goalsAgainst}</td>
                    <td>{stats.shots}</td>
                    <td>{stats.turnovers}</td>
                    <td>{stats.shootingPercentage.toFixed(1)}%</td>
                </tr>
                </tbody>
            </table>
        </div>
    );


    return (
        <div className={styles.container}>

            <div className={styles.teamInfo}>
                <p className={styles.teamName}>{team.name}</p>
                <img src={team.logo} alt={team.name} className={styles.teamLogo}/>
            </div>

            {isEditing ? (
                <>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Team name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="logo">Upload new logo:</label>
                        <input
                            type="file"
                            id="logo"
                            onChange={handleLogoChange}
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={styles.saveButton} onClick={handleSave}>Save Changes</button>
                        <button className={styles.backButton} onClick={handleDiscard}>Discard Changes</button>
                    </div>
                </>
            ) : (
                <div className={styles.buttonGroup}>
                    <button className={styles.editButton} onClick={handleEdit}>Edit Team</button>
                </div>
            )}

            <div className={styles.playersDropdown}>
                <div className={styles.dropdownHeader} onClick={() => setShowPlayers(!showPlayers)}>
                    <h3>Players</h3>
                    <span>{showPlayers ? '▲' : '▼'}</span>
                </div>
                {showPlayers && (
                    <>
                        {team.players && team.players.length > 0 ? (
                            <div className={styles.tableContainer}>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>#</th>
                                        <th>Position</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {team.players.map((player) => (
                                        <tr key={player.id}>
                                            <td>{player.name}</td>
                                            <td>{player.jerseyNumber}</td>
                                            <td>{player.position}</td>
                                            <td>
                                                <button className={styles.editButton}
                                                        onClick={() => navigate(`../../handlePlayers/${player.id}`, {state: {player}})}>View
                                                    Player
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className={styles.noPlayers}>No players</p>
                        )}
                    </>
                )}
            </div>

            <div className={styles.statsSection}>
                <h3 className={styles.subHeader}>Regular Season Stats</h3>
                <StatsTable stats={regularStats}/>

                <h3 className={styles.subHeader} style={{marginTop: '2rem'}}>Playoff Stats</h3>
                <StatsTable stats={playoffStats}/>
            </div>

            <div className={styles.gamesDropdown}>
                <div className={styles.dropdownHeader} onClick={() => setShowGames(!showGames)}>
                    <h3>Team Games</h3>
                    <span>{showGames ? '▲' : '▼'}</span>
                </div>
                {showGames && (
                    <PreviousGamesPage
                        playerGames={teamGames}
                        showFilters={false}
                    />
                )}
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.backButton} onClick={goBackHandler}>Go Back</button>
            </div>
        </div>
    );
};

export default HandleTeamPage;
