import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './CreateTeamPage.module.css';
import {TeamAlreadyExistsError} from "../OOP/errors/TeamAlreadyExistsError"; // Import the CSS module
import {IChampionship} from '../OOP/interfaces/IChampionship';
import {ITeam} from "../OOP/interfaces/ITeam";
import {IPlayer} from "../OOP/interfaces/IPlayer";

// todo: color styling, unify form with StartPage

const CreateTeamPage = () => {
    const championships = useLocation().state.championships as IChampionship[];
    const [name, setName] = useState<string>("");
    const [homeColor, setHomeColor] = useState<ITeamColor>({primary: "#000000", secondary: "#ffffff"});
    const [awayColor, setAwayColor] = useState<ITeamColor>({primary: "#ffffff", secondary: "#000000"});
    const [logo, setLogo] = useState<File | null>(null);
    const [championship, setChampionship] = useState<IChampionship[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only .jpg and .png formats are allowed.');
                const fileInput = document.getElementById("logoInput") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
                return;
            }

            // Check file size (10MB in bytes)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert('File size should not exceed 10MB.');
                const fileInput = document.getElementById("logoInput") as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = "";
                }
                return;
            }

            // If valid, set the logo
            setLogo(file);
        }
    };

    const handleHomePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHomeColor({...homeColor, primary: e.target.value});
    }

    const handleHomeSecondaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHomeColor({...homeColor, secondary: e.target.value});
    }

    const handleAwayPrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAwayColor({...awayColor, primary: e.target.value});
    }

    const handleAwaySecondaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAwayColor({...awayColor, secondary: e.target.value});
    }

    const handleChampionshipChange = (selectedChampionship: IChampionship) => {
        setChampionship(prevChampionships => {
            if (prevChampionships.find(ch => ch.id === selectedChampionship.id)) {
                return prevChampionships.filter(ch => ch.id !== selectedChampionship.id) as IChampionship[];
            } else {
                return [...prevChampionships, selectedChampionship] as IChampionship[];
            }
        });
    }

    const navigateHandler = () => {
        navigate("/handleTeams");
    }

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.length === 0) {
            return alert("Please enter a team name");
        }
        if (!logo) {
            return alert("Please upload a team logo");
        }
        if (homeColor.primary.length === 0) {
            return alert("Please enter a team home primary color");
        }
        if (homeColor.secondary.length === 0) {
            return alert("Please enter a team home secondary color");
        }
        if (awayColor.primary.length === 0) {
            return alert("Please enter a team away primary color");
        }
        if (awayColor.secondary.length === 0) {
            return alert("Please enter a team away secondary color");
        }
        if (championship.length === 0) {
            return alert("Please select a championship");
        }
        try {
            // TODO: should be atomic operation
            const logoURL = await TeamService.uploadLogo(logo);
            // const team = new Team("0", name, logoURL, homeColor, awayColor, championship);
            const team = {
                id: "0",
                name: name,
                logo: logoURL,
                homeColor: homeColor,
                awayColor: awayColor,
                championships: championship,
                players: [] as IPlayer[],
            } as ITeam
            await TeamService.createTeam(team);

            alert("Team created successfully!");
            setName("");
            setHomeColor({primary: "#000000", secondary: "#ffffff"});
            setAwayColor({primary: "#ffffff", secondary: "#000000"});
            setLogo(null);
            setChampionship([]);

            // Reset the file input
            const fileInput = document.getElementById("logoInput") as HTMLInputElement;
            if (fileInput) {
                fileInput.value = "";
            }

        } catch (error) {
            if (error instanceof TeamAlreadyExistsError) {
                alert(error.message);
                return;
            }
            console.error("Error uploading file:", error);
            alert("Something went wrong");
        }
    }

    useEffect(() => {
        if (championships.length > 0) {
            setIsLoaded(true);
        }
    }, [championships]);

    return (
        isLoaded ?
            <form className={styles.formContainer} onSubmit={submitHandler}>
                <div className={styles.formGroup}>
                    <label>Team name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Team logo:</label>
                    <input
                        id="logoInput"
                        type="file"
                        onChange={handleLogoChange}
                        required
                    />
                </div>

                <div>
                    <label>Home colors:</label>
                    <div className={styles.colorContainer}>
                        <div className={styles.colorGroup}>
                            <p>Primary</p>
                            <input
                                type="color"
                                value={homeColor.primary}
                                onChange={handleHomePrimaryColorChange}
                                required
                            />
                        </div>
                        <div className={styles.colorGroup}>
                            <p>Secondary</p>
                            <input
                                type="color"
                                value={homeColor.secondary}
                                onChange={handleHomeSecondaryColorChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label>Away colors:</label>
                    <div className={styles.colorContainer}>
                        <div className={styles.colorGroup}>
                            <p>Primary</p>
                            <input
                                type="color"
                                value={awayColor.primary}
                                onChange={handleAwayPrimaryColorChange}
                                required
                            />
                        </div>
                        <div className={styles.colorGroup}>
                            <p>Secondary</p>
                            <input
                                type="color"
                                value={awayColor.secondary}
                                onChange={handleAwaySecondaryColorChange}
                                required
                            />
                        </div>
                    </div>
                </div>


                <div className={styles.championshipContainer}>
                    <label>Championship:</label>
                    {championships && championships.map((ch) => (
                        <div key={ch.id}>
                            <input
                                type="checkbox"
                                value={ch.id}
                                onChange={() => {
                                    handleChampionshipChange(ch);
                                }}
                                checked={championship.includes(ch)}
                            />
                            <span>{ch.name}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.buttonGroup}>
                    <button className={styles.submitButton} type="submit">Create team</button>
                    <button className={styles.backButton} type="button" onClick={navigateHandler}>Go back</button>
                </div>
            </form> :
            <p>Loading...</p>
    );
};

export default CreateTeamPage;
