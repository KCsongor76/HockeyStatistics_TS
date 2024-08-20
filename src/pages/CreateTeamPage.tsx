import React, {useEffect, useState} from 'react';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {useLocation, useNavigate} from "react-router-dom";
import {TeamColor} from "../OOP/interfaces/TeamColor";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './CreateTeamPage.module.css'; // Import the CSS module

const CreateTeamPage = () => {
    const championships = useLocation().state.championships as Championship[];
    const [name, setName] = useState<string>("");
    const [homeColor, setHomeColor] = useState<TeamColor>({primary: "#000000", secondary: "#ffffff"});
    const [awayColor, setAwayColor] = useState<TeamColor>({primary: "#ffffff", secondary: "#000000"});
    const [logo, setLogo] = useState<File | null>(null);
    const [championship, setChampionship] = useState<Championship[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogo(e.target.files[0]);
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

    const handleChampionshipChange = (selectedChampionship: Championship) => {
        setChampionship(prevChampionships => {
            if (prevChampionships.find(ch => ch.id === selectedChampionship.id)) {
                return prevChampionships.filter(ch => ch.id !== selectedChampionship.id) as Championship[];
            } else {
                return [...prevChampionships, selectedChampionship] as Championship[];
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
            const teams = await TeamService.getAllTeams();
            const names = teams.map(t => t.name);
            if (names.includes(name)) {
                alert("Team already exists");
                return;
            }
            const logoURL = await TeamService.uploadLogo(logo);
            const team = new Team("0", name, logoURL, homeColor, awayColor, championship);
            console.log(team);
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
