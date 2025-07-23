import React, {useEffect, useState} from 'react';
import {storage} from "../firebaseConfig";
import {getDownloadURL, ref} from "firebase/storage";
import {useLoaderData, useNavigate} from "react-router-dom";
// @ts-ignore
import styles from './StartPage.module.css';
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {ITeam} from "../OOP/interfaces/ITeam";
import {IChampionship} from "../OOP/interfaces/IChampionship";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import {GameType} from "../OOP/enums/GameType";
import {Position} from "../OOP/enums/Position";
import {ChampionshipService} from "../OOP/services/ChampionshipService";
import {TeamService} from "../OOP/services/TeamService";
import ContinueOrStartOverModal from '../modals/ContinueOrStartOverModal';

type FormState = {
    championship: IChampionship;
    homeTeam: ITeam;
    awayTeam: ITeam;
    homeRoster: IPlayer[],
    homeRosterOut: IPlayer[],
    awayRosterOut: IPlayer[],
    awayRoster: IPlayer[],
    gameType: GameType;
    homeColor: ITeamColor;
    awayColor: ITeamColor;
    imageOption: {
        rinkUp: string;
        rinkDown: string;
    };
    selectedImage: string;
};

type LoaderData = {
    championships: IChampionship[];
    teams: ITeam[];
    rinkImages: {
        rinkUp: string;
        rinkDown: string;
    };
};

const StartPage: React.FC = () => {
    // First, get all the hooks declarations at the top in a consistent order
    const navigate = useNavigate();
    const rawLoaderData = useLoaderData() as LoaderData | null;

    // Always declare all useState hooks first, regardless of whether they depend on each other
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loaderData, setLoaderData] = useState<LoaderData | null>(null);
    const [formData, setFormData] = useState<FormState | null>(null);
    const [filteredTeams, setFilteredTeams] = useState<ITeam[]>([]);
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [showContinueModal, setShowContinueModal] = useState(false);
    const [savedGameState, setSavedGameState] = useState<any>(null);

    // Load data effect - this should be the first effect
    useEffect(() => {
        const loadData = async () => {
            if (rawLoaderData) {
                setLoaderData(rawLoaderData);
                setIsLoading(false);
            } else {
                try {
                    // Attempt to load data directly
                    const championships = await ChampionshipService.getAllChampionships();
                    const teams = await TeamService.getAllTeams();

                    const [rinkDown, rinkUp] = await Promise.all([
                        getDownloadURL(ref(storage, "rink-images/icerink_down.jpg")),
                        getDownloadURL(ref(storage, "rink-images/icerink_up.jpg")),
                    ]);

                    const data = {
                        championships,
                        teams,
                        rinkImages: {rinkUp, rinkDown}
                    };

                    setLoaderData(data);
                    setIsLoading(false);
                } catch (err) {
                    console.error("Error loading data:", err);
                    setError("Failed to load data. Please try again later.");
                    setIsLoading(false);
                }
            }
        };

        loadData();
    }, [rawLoaderData]);

    // Initialize form data once loader data is available
    useEffect(() => {
        if (!loaderData) return;

        const {championships, teams, rinkImages} = loaderData;

        // Get teams for the first championship
        const getInitialTeams = (championship: IChampionship, allTeams: ITeam[]) => {
            const teamsInChampionship = allTeams.filter(team =>
                team.championships.some(champ => champ.id === championship.id)
            );
            return {
                homeTeam: teamsInChampionship[0] || ({} as ITeam),
                awayTeam: teamsInChampionship[1] || teamsInChampionship[0] || ({} as ITeam)
            };
        };

        const initialTeams = championships.length > 0 ?
            getInitialTeams(championships[0], teams) :
            {homeTeam: {} as ITeam, awayTeam: {} as ITeam};

        const initialState: FormState = {
            championship: championships[0] || ({} as IChampionship),
            homeTeam: initialTeams.homeTeam,
            awayTeam: initialTeams.awayTeam,
            homeRoster: [],
            homeRosterOut: initialTeams.homeTeam.players || [],
            awayRoster: [],
            awayRosterOut: initialTeams.awayTeam.players || [],
            gameType: GameType.REGULAR,
            homeColor: teams[0]?.homeColor || ({} as ITeamColor),
            awayColor: teams[1]?.awayColor || ({} as ITeamColor),
            imageOption: {
                rinkUp: rinkImages.rinkUp || "",
                rinkDown: rinkImages.rinkDown || "",
            },
            selectedImage: "",
        };

        setFormData(initialState);
        setFilteredTeams(teams);
    }, [loaderData]);

    // Check for saved game
    useEffect(() => {
        const savedGame = localStorage.getItem('unfinishedGame');
        if (savedGame) {
            setSavedGameState(JSON.parse(savedGame));
            setShowContinueModal(true);
        }
    }, []);

    // Update filtered teams when championship changes
    useEffect(() => {
        if (!formData || !loaderData) return;

        const {championship} = formData;
        const {teams} = loaderData;

        if (!championship || championship.id === "") {
            setFilteredTeams(teams);
            return;
        }

        const newFilteredTeams = teams.filter(team =>
            team.championships.some(champ => champ.id === championship.id)
        );

        setFilteredTeams(newFilteredTeams);

        // Get default teams and their colors
        const newHomeTeam = newFilteredTeams[0] ?? {} as ITeam;
        const newAwayTeam = newFilteredTeams[1] ?? newFilteredTeams[0] ?? {} as ITeam;

        // Only update teams if current teams are not in the filtered list
        const updateTeams = !newFilteredTeams.some(team => team.id === formData.homeTeam.id) ||
            !newFilteredTeams.some(team => team.id === formData.awayTeam.id);

        if (updateTeams) {
            setFormData({
                ...formData,
                homeTeam: newHomeTeam,
                awayTeam: newAwayTeam,
                homeColor: newHomeTeam.homeColor || formData.homeColor,
                awayColor: newAwayTeam.awayColor || formData.awayColor,
                homeRoster: [],
                homeRosterOut: newHomeTeam.players || [],
                awayRoster: [],
                awayRosterOut: newAwayTeam.players || [],
            });
        }
    }, [formData?.championship, loaderData]);

    // Return early with loading or error state
    if (isLoading) {
        return <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading game data...</p>
        </div>;
    }

    if (error || !loaderData || !formData) {
        return <div className={styles.errorContainer}>
            <h2>Error</h2>
            <p>{error || "Something went wrong. Please try again."}</p>
            <button
                className={styles.rosterButton}
                onClick={() => window.location.reload()}
            >
                Reload Page
            </button>
        </div>;
    }

    const {championships, teams} = loaderData;

    if (championships.length === 0 || teams.length === 0) {
        return <div className={styles.errorContainer}>
            <h2>No Data Available</h2>
            <p>There are no championships or teams available. Please check your database.</p>
            <button
                className={styles.rosterButton}
                onClick={() => window.location.reload()}
            >
                Reload Page
            </button>
        </div>;
    }

    // Image click handler for rink selection
    const handleImageClick = (imageUrl: string) => {
        setFormData({
            ...formData,
            selectedImage: imageUrl,
        });
    };

    const validateRosterLimits = (roster: IPlayer[], isHome: boolean) => {
        const isErste = formData.championship.name.toLowerCase().includes('erste');
        const maxSkaters = isErste ? 19 : 20;
        const maxGoalies = 2;

        const goalies = roster.filter(p => p.position === 'Goalie').length;
        const skaters = roster.length - goalies;

        if (goalies > maxGoalies) {
            alert(`${isHome ? 'Home' : 'Away'} team cannot have more than ${maxGoalies} goalies`);
            return false;
        }

        if (skaters > maxSkaters) {
            alert(`${isHome ? 'Home' : 'Away'} team cannot have more than ${maxSkaters} skaters`);
            return false;
        }

        return true;
    };

    const validateMinimumPlayers = (roster: IPlayer[]) => {
        const goalies = roster.filter(p => p.position === 'Goalie').length;
        const skaters = roster.length - goalies;
        return skaters >= 15 && goalies >= 2;
    };

    const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Existing validation
        if (formData.championship.name == "") {
            alert("Please select a championship");
            return;
        }

        if (formData.homeTeam.id === formData.awayTeam.id) {
            alert("Please select different teams");
            return;
        }

        if (formData.selectedImage === "") {
            alert("Please select an image");
            return;
        }

        // New roster validation
        if (formData.homeRoster.length === 0) {
            alert("Please add at least one player to the home team roster");
            return;
        }

        if (formData.awayRoster.length === 0) {
            alert("Please add at least one player to the away team roster");
            return;
        }

        // todo:
        // if (!validateMinimumPlayers(formData.homeRoster)) {
        //     alert("Home team needs at least 15 skaters and 2 goalies");
        //     return;
        // }
        //
        // if (!validateMinimumPlayers(formData.awayRoster)) {
        //     alert("Away team needs at least 15 skaters and 2 goalies");
        //     return;
        // }

        localStorage.setItem("formData", JSON.stringify(formData));
        navigate("/game", {state: {formData}});
    };

    const navigateHandler = () => {
        navigate("/")
    }

    // Handle Continue button
    const handleContinue = () => {
        navigate('/game', {state: {savedGameState: savedGameState}});
        setShowContinueModal(false);
    };

    // Handle Start Over button
    const handleStartOver = () => {
        localStorage.removeItem('unfinishedGame');
        setShowContinueModal(false);
    };

    const addPlayerToRosterHandler = (player: IPlayer, isHome: boolean) => {
        setFormData(prev => {
            if (!prev) return prev;

            const currentRoster = isHome ? prev.homeRoster : prev.awayRoster;
            const isGoalie = player.position === 'Goalie';

            const currentGoalies = currentRoster.filter(p => p.position === Position.GOALIE).length;
            const currentSkaters = currentRoster.filter(p => p.position !== Position.GOALIE).length;

            const isErste = prev.championship.name.toLowerCase().includes('erste');
            const maxSkaters = isErste ? 19 : 20;
            const maxGoalies = 2;

            if (isGoalie && currentGoalies >= maxGoalies) {
                alert(`Maximum ${maxGoalies} goalies allowed`);
                return prev;
            }

            if (!isGoalie && currentSkaters >= maxSkaters) {
                alert(`Maximum ${maxSkaters} skaters allowed`);
                return prev;
            }

            if (isHome) {
                const newHomeRosterOut = prev.homeRosterOut.filter(p => p.id !== player.id);
                const newHomeRoster = [...prev.homeRoster, player];
                return {
                    ...prev,
                    homeRoster: newHomeRoster,
                    homeRosterOut: newHomeRosterOut
                };
            } else {
                const newAwayRosterOut = prev.awayRosterOut.filter(p => p.id !== player.id);
                const newAwayRoster = [...prev.awayRoster, player];
                return {
                    ...prev,
                    awayRoster: newAwayRoster,
                    awayRosterOut: newAwayRosterOut
                };
            }
        });
    };

    const removePlayerFromRosterHandler = (player: IPlayer, isHome: boolean) => {
        setFormData(prev => {
            if (!prev) return prev;

            if (isHome) {
                const newHomeRoster = prev.homeRoster.filter(p => p.id !== player.id);
                const newHomeRosterOut = [...prev.homeRosterOut, player];
                return {
                    ...prev,
                    homeRoster: newHomeRoster,
                    homeRosterOut: newHomeRosterOut
                };
            } else {
                const newAwayRoster = prev.awayRoster.filter(p => p.id !== player.id);
                const newAwayRosterOut = [...prev.awayRosterOut, player];
                return {
                    ...prev,
                    awayRoster: newAwayRoster,
                    awayRosterOut: newAwayRosterOut
                };
            }
        });
    };

    const renderPositionSection = (players: IPlayer[], position: Position, isHome: boolean) => (
        <>
            <h4>{position}s</h4>
            <table className={styles.table}>
                <thead>
                <tr className={styles.tr}>
                    <th className={styles.th}>#</th>
                    <th className={styles.th}>Name</th>
                    <th className={styles.th}></th>
                </tr>
                </thead>
                <tbody>
                {players
                    .filter(player => player.position === position)
                    .map(player => (
                        <tr key={player.id} className={styles.tr}>
                            <td className={styles.td}>{player.jerseyNumber}</td>
                            <td className={styles.td}>{player.name}</td>
                            <td className={styles.td}>
                                <button
                                    className={`${styles.rosterButton} ${styles.addButton}`}
                                    type="button"
                                    onClick={() => addPlayerToRosterHandler(player, isHome)}
                                >
                                    Add
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

    return (
        <form className={styles.formContainer} onSubmit={submitHandler}>
            {showContinueModal && (
                <ContinueOrStartOverModal
                    onContinue={handleContinue}
                    onStartOver={handleStartOver}
                />
            )}
            <div className={styles.formGroup}>
                <label className={styles.label}>Select Championship</label>
                <select
                    value={formData.championship.id}
                    onChange={(event) => {
                        const selectedChampionship = championships.find((c) => c.id === event.target.value) ?? {} as IChampionship;
                        setFormData({
                            ...formData,
                            championship: selectedChampionship,
                        });
                    }}
                    className={styles.select}
                >
                    <option key="" value="" disabled>
                        Select Championship
                    </option>
                    {championships.map((championship) => (
                        <option key={championship.id} value={championship.id}>
                            {championship.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Select Home Team</label>
                <select
                    value={formData.homeTeam.id}
                    onChange={(event) => {
                        const newHomeTeam = filteredTeams.find((t) => t.id === event.target.value) ?? {} as ITeam;
                        setFormData({
                            ...formData,
                            homeTeam: newHomeTeam as ITeam,
                            homeColor: newHomeTeam.homeColor || formData.homeColor,
                            homeRoster: [],
                            homeRosterOut: newHomeTeam.players as IPlayer[],
                        });
                        setIsDropDownOpen(false);
                    }}
                    className={styles.select}
                >
                    {filteredTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Select Away Team</label>
                <select
                    value={formData.awayTeam.id}
                    onChange={(event) => {
                        const newAwayTeam = filteredTeams.find((t) => t.id === event.target.value) ?? {} as ITeam;
                        setFormData({
                            ...formData,
                            awayTeam: newAwayTeam as ITeam,
                            awayColor: newAwayTeam.awayColor || formData.awayColor,
                            awayRoster: [],
                            awayRosterOut: newAwayTeam.players as IPlayer[],
                        });
                        setIsDropDownOpen(false);
                    }}
                    className={styles.select}
                >
                    {filteredTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Select Game Type</label>
                <select
                    value={formData.gameType}
                    onChange={(event) =>
                        setFormData({
                            ...formData,
                            gameType: event.target.value as GameType,
                        })
                    }
                    className={styles.select}
                >
                    {Object.values(GameType).map((gameType) => (
                        <option key={gameType} value={gameType}>
                            {gameType}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Select home team colors: </label>
                <div className={styles.colorPickerContainer}>
                    <input
                        type="color"
                        value={formData.homeColor.primary}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                homeColor: {...formData.homeColor, primary: event.target.value},
                            })
                        }
                        className={styles.inputColor}
                    />
                    <input
                        type="color"
                        value={formData.homeColor.secondary}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                homeColor: {...formData.homeColor, secondary: event.target.value},
                            })
                        }
                        className={styles.inputColor}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Select away team colors: </label>
                <div className={styles.colorPickerContainer}>
                    <input
                        type="color"
                        value={formData.awayColor.primary}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                awayColor: {...formData.awayColor, primary: event.target.value},
                            })
                        }
                        className={styles.inputColor}
                    />
                    <input
                        type="color"
                        value={formData.awayColor.secondary}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                awayColor: {...formData.awayColor, secondary: event.target.value},
                            })
                        }
                        className={styles.inputColor}
                    />
                </div>
            </div>

            {!isDropDownOpen &&
                <button
                    className={styles.rosterButton}
                    type="button"
                    onClick={() => {
                        setIsDropDownOpen(true)
                    }}>
                    Select Rosters
                </button>}

            {isDropDownOpen && (
                <div>
                    <h3>Home Team Roster</h3>
                    {renderPositionSection(formData.homeRosterOut, Position.GOALIE, true)}
                    {renderPositionSection(formData.homeRosterOut, Position.DEFENDER, true)}
                    {renderPositionSection(formData.homeRosterOut, Position.FORWARD, true)}

                    <h4>Selected Home Roster</h4>
                    <table className={styles.table}>
                        <thead>
                        <tr className={styles.tr}>
                            <th className={styles.th}>#</th>
                            <th className={styles.th}>Name</th>
                            <th className={styles.th}>Position</th>
                            <th className={styles.th}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {formData.homeRoster.map(player => (
                            <tr key={player.id} className={styles.tr}>
                                <td className={styles.td}>{player.jerseyNumber}</td>
                                <td className={styles.td}>{player.name}</td>
                                <td className={styles.td}>{player.position}</td>
                                <td className={styles.td}>
                                    <button
                                        className={`${styles.rosterButton} ${styles.removeButton}`}
                                        type="button"
                                        onClick={() => removePlayerFromRosterHandler(player, true)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <h3>Away Team Roster</h3>
                    {renderPositionSection(formData.awayRosterOut, Position.GOALIE, false)}
                    {renderPositionSection(formData.awayRosterOut, Position.DEFENDER, false)}
                    {renderPositionSection(formData.awayRosterOut, Position.FORWARD, false)}

                    <h4>Selected Away Roster</h4>
                    <table className={styles.table}>
                        <thead>
                        <tr className={styles.tr}>
                            <th className={styles.th}>#</th>
                            <th className={styles.th}>Name</th>
                            <th className={styles.th}>Position</th>
                            <th className={styles.th}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {formData.awayRoster.map(player => (
                            <tr key={player.id} className={styles.tr}>
                                <td className={styles.td}>{player.jerseyNumber}</td>
                                <td className={styles.td}>{player.name}</td>
                                <td className={styles.td}>{player.position}</td>
                                <td className={styles.td}>
                                    <button
                                        className={`${styles.rosterButton} ${styles.removeButton}`}
                                        type="button"
                                        onClick={() => removePlayerFromRosterHandler(player, false)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <button
                        className={styles.rosterButton}
                        type="button"
                        onClick={() => setIsDropDownOpen(false)}
                    >
                        Close Roster Selection
                    </button>
                </div>
            )}

            <div className={styles.formGroup}>
                <label className={styles.label}>Select Rink Image:</label>
                <div
                    className={styles.radioContainer}
                    onClick={() => handleImageClick(formData.imageOption.rinkDown)}
                >
                    <input
                        type="radio"
                        name="imageOption"
                        value={formData.imageOption.rinkDown}
                        checked={formData.selectedImage === formData.imageOption.rinkDown}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                selectedImage: event.target.value,
                            })
                        }
                        className={styles.radioInput}
                    />
                    <img
                        src={formData.imageOption.rinkDown}
                        alt="RinkImage"
                        className={`${styles.imagePreview} ${formData.selectedImage === formData.imageOption.rinkDown ? styles.selectedImage : ''}`}
                    />
                </div>
                <div
                    className={styles.radioContainer}
                    onClick={() => handleImageClick(formData.imageOption.rinkUp)}
                >
                    <input
                        type="radio"
                        name="imageOption"
                        value={formData.imageOption.rinkUp}
                        checked={formData.selectedImage === formData.imageOption.rinkUp}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                selectedImage: event.target.value,
                            })
                        }
                        className={styles.radioInput}
                    />
                    <img
                        src={formData.imageOption.rinkUp}
                        alt="RinkImage"
                        className={`${styles.imagePreview} ${formData.selectedImage === formData.imageOption.rinkUp ? styles.selectedImage : ''}`}
                    />
                </div>
            </div>
            <button
                type="submit"
                className={styles.rosterButton}
            >Start Game
            </button>
            <button
                type="button"
                className={styles.rosterButton}
                onClick={navigateHandler}>Go Back
            </button>
        </form>
    );
};

export default StartPage;

export const loader = async () => {
    console.log("loader")
    try {
        const championships = await ChampionshipService.getAllChampionships();
        const teams = await TeamService.getAllTeams();

        const [rinkDown, rinkUp] = await Promise.all([
            getDownloadURL(ref(storage, "rink-images/icerink_down.jpg")),
            getDownloadURL(ref(storage, "rink-images/icerink_up.jpg")),
        ]);

        const rinkImages = {rinkUp, rinkDown};
        return {championships, teams, rinkImages};

    } catch (error) {
        console.error("Error in loader function:", error);
        // Return null explicitly rather than letting it fall through to undefined
        return null;
    }
};