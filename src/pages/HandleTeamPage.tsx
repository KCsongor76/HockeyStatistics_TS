import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
// @ts-ignore
import styles from './HandleTeamPage.module.css';
import {GameService} from "../OOP/services/GameService";
import {IGame} from "../OOP/interfaces/IGame";
import PreviousGamesPage from "./PreviousGamesPage";
import {GameType} from "../OOP/enums/GameType";
import {Team} from "../OOP/classes/Team";
import {TeamStats} from "../OOP/classes/TeamStats";

// todo: when editing, it works. But if I refresh the page after editing,
//  then it gets back to the original data. But if I "Go Back", then the team shows up updated.
//  so there's a small - temporary bug when refreshing right after editing.

// todo: when editing team, and we change the logo, delete the old logo from storage.

// todo: show more stats on players - sorting table.

const HandleTeamPage = () => {
    // const { teamId } = useParams<{ teamId: string }>();
    // const navigate = useNavigate();
    // const [team, setTeam] = useState<Team | null>(null);

    const location = useLocation();
    const initialTeam = Team.fromPlain(location.state.team); // Convert to Team instance
    const [team, setTeam] = useState<Team>(initialTeam);
    const [name, setName] = useState(initialTeam.name);
    const [logo, setLogo] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [games, setGames] = useState<IGame[]>([]);
    const [showPlayers, setShowPlayers] = useState(false);
    const [showGames, setShowGames] = useState(false);

    const navigate = useNavigate();

    const filterGames = (type?: GameType) => {
        return games.filter(game => {
            const isTeamGame = game.teams?.home.id === team.id || game.teams?.away.id === team.id;
            return type ? isTeamGame && game.type === type : isTeamGame;
        });
    };

    const teamGames = filterGames();
    const regularSeasonGames = filterGames(GameType.REGULAR);
    const playoffGames = filterGames(GameType.PLAYOFF);

    // Calculate stats using TeamStats class
    const regularStats = new TeamStats(team.id, regularSeasonGames);
    const playoffStats = new TeamStats(team.id, playoffGames);

    const goBackHandler = () => navigate("/handleTeams");

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
            const updatedTeam = await team.update(name, logo);
            setTeam(updatedTeam);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating team:", error);
            alert("Something went wrong");
        }
    };

    const handleEdit = () => setIsEditing(true);

    const handleDiscard = () => {
        setTeam(initialTeam);
        setName(initialTeam.name);
        setIsEditing(false);
    };

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



    return (
        <div>

            <div>
                <p>{team.name}</p>
                <img src={team.logo} alt={team.name}/>
            </div>

            {isEditing ? (
                <>
                    <div>
                        <label htmlFor="name">Team name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={handleNameChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="logo">Upload new logo:</label>
                        <input
                            type="file"
                            id="logo"
                            onChange={handleLogoChange}
                        />
                    </div>

                    <div>
                        <button onClick={handleSave}>Save Changes</button>
                        <button onClick={handleDiscard}>Discard Changes</button>
                    </div>
                </>
            ) : (
                <div>
                    <button onClick={handleEdit}>Edit Team</button>
                </div>
            )}

            <div>
                <div onClick={() => setShowPlayers(!showPlayers)}>
                    <h3>Players</h3>
                    <span>{showPlayers ? '▲' : '▼'}</span>
                </div>
                {showPlayers && (
                    <>
                        {team.players && team.players.length > 0 ? (
                            <div>
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
                                                <button
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
                            <p>No players</p>
                        )}
                    </>
                )}
            </div>

            <div>
                <h3>Regular Season Stats</h3>
                <div>
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
                            <th>S%</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{regularStats.gamesPlayed}</td>
                            <td>{regularStats.wins}</td>
                            <td>{regularStats.losses}</td>
                            <td>{regularStats.goalsFor}</td>
                            <td>{regularStats.goalsAgainst}</td>
                            <td>{regularStats.shots}</td>
                            <td>{regularStats.turnovers}</td>
                            <td>{regularStats.shootingPercentage.toFixed(1)}%</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <h3 style={{marginTop: '2rem'}}>Playoff Stats</h3>
                <div>
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
                            <th>S%</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{playoffStats.gamesPlayed}</td>
                            <td>{playoffStats.wins}</td>
                            <td>{playoffStats.losses}</td>
                            <td>{playoffStats.goalsFor}</td>
                            <td>{playoffStats.goalsAgainst}</td>
                            <td>{playoffStats.shots}</td>
                            <td>{playoffStats.turnovers}</td>
                            <td>{playoffStats.shootingPercentage.toFixed(1)}%</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            <div>
                <div onClick={() => setShowGames(!showGames)}>
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

            <div>
                <button onClick={goBackHandler}>Go Back</button>
            </div>
        </div>
    );
};

export default HandleTeamPage;
