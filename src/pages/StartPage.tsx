import React, {useEffect, useState} from 'react';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {GameType} from "../OOP/enums/GameType";
import {useLoaderData, useNavigate} from "react-router-dom";
import {TeamColor} from "../OOP/interfaces/TeamColor";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
// @ts-ignore
import styles from './StartPage.module.css';
import {ChampionshipService} from "../OOP/services/ChampionshipService";
import {TeamService} from "../OOP/services/TeamService";
import ContinueOrStartOverModal from "../modals/ContinueOrStartOverModal";
import {storage} from "../firebaseConfig";

type FormState = {
    championship: Championship;
    homeTeam: Team;
    awayTeam: Team;
    gameType: GameType;
    homeColor: TeamColor;
    awayColor: TeamColor;
    imageOption: {
        rinkUp: string;
        rinkDown: string;
    };
    selectedImage: string;
};

type LoaderData = {
    championships: Championship[];
    teams: Team[];
    rinkImages: {
        rinkUp: string;
        rinkDown: string;
    };
};

// TODO: colors should correspond to team colors
// TODO: image selection: should be able to click the rinkImage also
// TODO: if championship is "", should be an error
// TODO: same team error

const StartPage: React.FC = () => {
    const loaderData = useLoaderData() as LoaderData;

    const championships = loaderData?.championships ?? [];
    const teams = loaderData?.teams ?? [];
    const rinkImages = loaderData?.rinkImages ?? {};

    const initialState: FormState = {
        championship: new Championship(),
        homeTeam: new Team(),
        awayTeam: new Team(),
        gameType: GameType.REGULAR,
        homeColor: {
            primary: '#000000',
            secondary: '#ffffff',
        },
        awayColor: {
            primary: '#000000',
            secondary: '#ffffff',
        },
        imageOption: {
            rinkUp: rinkImages.rinkUp,
            rinkDown: rinkImages.rinkDown,
        },
        selectedImage: rinkImages.rinkUp,
    };

    const [formData, setFormData] = useState<FormState>(initialState);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>(teams);
    const navigate = useNavigate();

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const continueHandler = () => {
        setModalIsOpen(false);
        const storedFormData = localStorage.getItem("formData");
        navigate("/game", {state: {storedFormData}});
    }

    const startOverHandler = () => {
        setModalIsOpen(false);
        localStorage.removeItem("formData");
    }

    const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        localStorage.setItem("formData", JSON.stringify(formData));
        navigate("/game", {state: {formData}});
    };

    const navigateHandler = () => {
        navigate("/")
    }

    useEffect(() => {
        const storedFormData = localStorage.getItem("formData");
        if (storedFormData) {
            setModalIsOpen(true);
        }
    }, []);

    // Update filtered teams when championship changes
    useEffect(() => {
        const filteredTeams = formData.championship.id !== ""
            ? teams.filter(team => team.championships.some(champ => champ.id === formData.championship.id))
            : teams;

        /* todo: check this out later
        const filteredTeams = formData.championship.id !== ""
            ? teams.filter(team => team.championships.some(champ => champ.equals(formData.championship)))
            : teams;*/


        setFilteredTeams(filteredTeams);

        // Automatically update the home and away teams to the first teams in the filtered list
        setFormData({
            ...formData,
            homeTeam: filteredTeams[0] ?? new Team(),
            awayTeam: filteredTeams[1] ?? filteredTeams[0] ?? new Team(),
        });
    }, [formData.championship, teams]);

    if (championships.length === 0 || teams.length === 0) {
        return <div>Loading...</div>;
    }


    return (
        <>
            <ContinueOrStartOverModal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                onContinue={continueHandler}
                onStartOver={startOverHandler}
            />

            <form className={styles.formContainer} onSubmit={submitHandler}>
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
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                homeTeam: filteredTeams.find((t) => t.id === event.target.value) ?? new Team(),
                            })
                        }
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
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                awayTeam: filteredTeams.find((t) => t.id === event.target.value) ?? new Team(),
                            })
                        }
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

                <div className={styles.formGroup}>
                    <label className={styles.label}>Select Rink Image:</label>
                    <div className={styles.radioContainer}>
                        <input
                            type="radio"
                            name="imageOption"
                            value={formData.imageOption.rinkDown}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    selectedImage: event.target.value,
                                })
                            }
                            className={styles.radioInput}
                        />
                        <img src={formData.imageOption.rinkDown} alt="RinkImage" className={styles.imagePreview}/>
                    </div>
                    <div className={styles.radioContainer}>
                        <input
                            type="radio"
                            name="imageOption"
                            value={formData.imageOption.rinkUp}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    selectedImage: event.target.value,
                                })
                            }
                            className={styles.radioInput}
                        />
                        <img src={formData.imageOption.rinkUp} alt="RinkImage" className={styles.imagePreview}/>
                    </div>
                </div>
                <button type="submit">Start Game</button>
                <button type="button" onClick={navigateHandler}>Go Back</button>
            </form>
        </>
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
