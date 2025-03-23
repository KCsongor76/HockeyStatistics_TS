import React, {useEffect, useState} from 'react';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {GameType} from "../OOP/enums/GameType";
import {useLoaderData, useNavigate} from "react-router-dom";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import {getDownloadURL, ref} from "firebase/storage";
// @ts-ignore
import styles from './StartPage.module.css';
import {ChampionshipService} from "../OOP/services/ChampionshipService";
import {TeamService} from "../OOP/services/TeamService";
import {storage} from "../firebaseConfig";
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {ITeam} from "../OOP/interfaces/ITeam";
import ContinueOrStartOverModal from '../modals/ContinueOrStartOverModal';

// todo: roster selection - fix styling, roster selection table styling incorrect when media width is less than 768px
// todo: make smaller components

type FormState = {
    championship: Championship;
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
    championships: Championship[];
    teams: ITeam[];
    rinkImages: {
        rinkUp: string;
        rinkDown: string;
    };
};

const StartPage: React.FC = () => {
    const loaderData = useLoaderData() as LoaderData;

    const championships = loaderData?.championships ?? [];
    const teams = loaderData?.teams ?? [];
    const rinkImages = loaderData?.rinkImages ?? {};

    // Get teams for the first championship
    const getInitialTeams = (championship: Championship, allTeams: ITeam[]) => {
        const teamsInChampionship = allTeams.filter(team =>
            team.championships.some(champ => champ.id === championship.id)
        );
        return {
            homeTeam: teamsInChampionship[0] as ITeam,
            awayTeam: teamsInChampionship[1] as ITeam
        };
    };

    const initialTeams = getInitialTeams(championships[0], teams);


    const initialState: FormState = {
        championship: championships[0],
        homeTeam: initialTeams.homeTeam,
        awayTeam: initialTeams.awayTeam,
        homeRoster: [],
        homeRosterOut: initialTeams.homeTeam.players,
        awayRoster: [],
        awayRosterOut: initialTeams.awayTeam.players,
        gameType: GameType.REGULAR,
        homeColor: teams[0].homeColor,
        awayColor: teams[1].awayColor,
        imageOption: {
            rinkUp: rinkImages.rinkUp,
            rinkDown: rinkImages.rinkDown,
        },
        selectedImage: "",
    };

    const [formData, setFormData] = useState<FormState>(initialState);
    const [filteredTeams, setFilteredTeams] = useState<ITeam[]>(teams);
    const navigate = useNavigate();
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);

    const [showContinueModal, setShowContinueModal] = useState(false);
    const [savedGameState, setSavedGameState] = useState<any>(null);

    // Image click handler for rink selection
    const handleImageClick = (imageUrl: string) => {
        setFormData({
            ...formData,
            selectedImage: imageUrl,
        });
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

        localStorage.setItem("formData", JSON.stringify(formData));
        navigate("/game", {state: {formData}});
    };

    const navigateHandler = () => {
        navigate("/")
    }

    /*useEffect(() => {
        const storedFormData = localStorage.getItem("formData");
        if (storedFormData) {
            setModalIsOpen(true);
        }
    }, []);*/

    // Update filtered teams when championship changes
    useEffect(() => {
        if (!formData.championship || formData.championship.id === "") {
            setFilteredTeams(teams);
            return;
        }

        const filteredTeams = teams.filter(team =>
            team.championships.some(champ => champ.id === formData.championship.id)
        );

        setFilteredTeams(filteredTeams);

        // Get default teams and their colors
        const newHomeTeam = filteredTeams[0] ?? new Team();
        const newAwayTeam = filteredTeams[1] ?? filteredTeams[0] ?? new Team();

        // Only update teams if current teams are not in the filtered list
        const updateTeams = !filteredTeams.some(team => team.id === formData.homeTeam.id) ||
            !filteredTeams.some(team => team.id === formData.awayTeam.id);

        if (updateTeams) {
            setFormData({
                ...formData,
                homeTeam: newHomeTeam,
                awayTeam: newAwayTeam,
                homeColor: newHomeTeam.homeColor || initialState.homeColor,
                awayColor: newAwayTeam.awayColor || initialState.awayColor,
                homeRoster: [],
                homeRosterOut: newHomeTeam.players,
                awayRoster: [],
                awayRosterOut: newAwayTeam.players,
            });
        }
    }, [formData.championship, teams]);

    useEffect(() => {
        const savedGame = localStorage.getItem('unfinishedGame');
        if (savedGame) {
            setSavedGameState(JSON.parse(savedGame));
            setShowContinueModal(true);
        }
    }, []);

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

    if (championships.length === 0 || teams.length === 0) {
        return <div>Loading...</div>;
    }

    function addPlayerToRosterHandler(player: IPlayer, isHome: boolean) {
        setFormData(prev => {
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
    }

    function removePlayerFromRosterHandler(player: IPlayer, isHome: boolean) {
        setFormData(prev => {
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
    }

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
                        const selectedChampionship = championships.find((c) => c.id === event.target.value) ?? new Championship();
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
                        const newHomeTeam = filteredTeams.find((t) => t.id === event.target.value) ?? new Team();
                        setFormData({
                            ...formData,
                            homeTeam: newHomeTeam as ITeam,
                            homeColor: newHomeTeam.homeColor || initialState.homeColor,
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
                        const newAwayTeam = filteredTeams.find((t) => t.id === event.target.value) ?? new Team();
                        setFormData({
                            ...formData,
                            awayTeam: newAwayTeam as ITeam,
                            awayColor: newAwayTeam.awayColor || initialState.awayColor,
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
                    <table className={styles.table}>
                        <thead>
                        <tr className={styles.tr}>
                            <th className={styles.th}>#</th>
                            <th className={styles.th}>Name</th>
                            <th className={styles.th}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {formData.homeRosterOut.map((player) => (
                            <tr key={player.id} className={styles.tr}>
                                <td className={styles.td}>{player.jerseyNumber}</td>
                                <td className={styles.td}>{player.name}</td>
                                <td className={styles.td}>
                                    <button
                                        className={`${styles.rosterButton} ${styles.addButton}`}
                                        type="button"
                                        onClick={() => addPlayerToRosterHandler(player, true)}
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <h4>Selected Home Roster</h4>
                    <table className={styles.table}>
                        <thead>
                        <tr className={styles.tr}>
                            <th className={styles.th}>#</th>
                            <th className={styles.th}>Name</th>
                            <th className={styles.th}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {formData.homeRoster.map((player) => (
                            <tr key={player.id} className={styles.tr}>
                                <td className={styles.td}>{player.jerseyNumber}</td>
                                <td className={styles.td}>{player.name}</td>
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

                    {/* Away Team Roster Selection */}
                    <h3>Away Team Roster</h3>
                    <table className={styles.table}>
                        <thead>
                        <tr className={styles.tr}>
                            <th className={styles.th}>#</th>
                            <th className={styles.th}>Name</th>
                            <th className={styles.th}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {formData.awayRosterOut.map((player) => (
                            <tr key={player.id} className={styles.tr}>
                                <td className={styles.td}>{player.jerseyNumber}</td>
                                <td className={styles.td}>{player.name}</td>
                                <td className={styles.td}>
                                    <button
                                        className={`${styles.rosterButton} ${styles.addButton}`}
                                        type="button"
                                        onClick={() => addPlayerToRosterHandler(player, false)}
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <h4>Selected Away Roster</h4>
                    <table className={styles.table}>
                        <thead>
                        <tr className={styles.tr}>
                            <th className={styles.th}>#</th>
                            <th className={styles.th}>Name</th>
                            <th className={styles.th}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {formData.awayRoster.map((player) => (
                            <tr key={player.id} className={styles.tr}>
                                <td className={styles.td}>{player.jerseyNumber}</td>
                                <td className={styles.td}>{player.name}</td>
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
                        //onClick={() => handleImageClick(formData.imageOption.rinkDown)}
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
                        //onClick={() => handleImageClick(formData.imageOption.rinkUp)}
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
    const championships = await ChampionshipService.getAllChampionships();
    const teams = await TeamService.getAllTeams();

    try {
        const [rinkDown, rinkUp] = await Promise.all([
            getDownloadURL(ref(storage, "rink-images/icerink_down.jpg")),
            getDownloadURL(ref(storage, "rink-images/icerink_up.jpg")),
        ]);

        const rinkImages = {rinkUp, rinkDown};
        return {championships, teams, rinkImages};

    } catch (error) {
        console.error("Error fetching download URLs:", error);
    }
};
