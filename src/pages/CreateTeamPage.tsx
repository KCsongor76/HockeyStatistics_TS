import React, {useEffect, useState} from 'react';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {useLocation, useNavigate} from "react-router-dom";
import {TeamColor} from "../OOP/interfaces/TeamColor";
import {TeamService} from "../OOP/services/TeamService";

const CreateTeamPage = () => {

    const championships = useLocation().state.championships as Championship[]

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

    const handleChampionshipChange = (championship: Championship) => {
        setChampionship(prevChampionships => {
            if (prevChampionships.length === 0) {
                return [championship];
            }
            if (prevChampionships.find(ch => ch.id === championship.id)) {
                return prevChampionships.filter(ch => ch.id !== championship.id);
            }
            return [...prevChampionships, championship];
        })
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
            // TODO: this should be an atomic operation
            const teams = await TeamService.getAllTeams()
            const names = teams.map(t => t.name);
            if (names.includes(name)) {
                alert("Team already exists");
                return new Error("Team already exists");
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

        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Something went wrong");
        }
    }

    useEffect(() => {
        if (championships.length > 0) {
            setIsLoaded(true);
        }
    }, []);

    return (isLoaded ?
            <form onSubmit={submitHandler}>
                <div>
                    <label>Team name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        required
                    />
                </div>

                <div>
                    <label>Team logo:</label>
                    <input
                        type="file"
                        onChange={handleLogoChange}
                        required
                    />
                </div>

                <div>
                    <label>Home colors:</label>
                    <p>Primary</p>
                    <input
                        type="color"
                        value={homeColor.primary}
                        onChange={handleHomePrimaryColorChange}
                        required
                    />
                    <p>Secondary</p>
                    <input
                        type="color"
                        value={homeColor.secondary}
                        onChange={handleHomeSecondaryColorChange}
                        required
                    />
                </div>

                <div>
                    <label>Away colors:</label>
                    <p>Primary</p>
                    <input
                        type="color"
                        value={awayColor.primary}
                        onChange={handleAwayPrimaryColorChange}
                        required
                    />
                    <p>Secondary</p>
                    <input
                        type="color"
                        value={awayColor.secondary}
                        onChange={handleAwaySecondaryColorChange}
                        required
                    />
                </div>

                <div>
                    <label>Championship:</label>
                    {championships && championships.map((championship) => (
                        <div key={championship.id}>
                            <input
                                type="checkbox"
                                value={championship.id}
                                onChange={() => {
                                    handleChampionshipChange(championship);
                                }}
                                // TODO: checked
                            />
                            <span>{championship.name}</span>
                        </div>
                    ))}
                </div>

                <button type="submit">Create team</button>
                <button type="button" onClick={navigateHandler}>Go back</button>
            </form> : <p>Loading...</p>
    );
};

export default CreateTeamPage;