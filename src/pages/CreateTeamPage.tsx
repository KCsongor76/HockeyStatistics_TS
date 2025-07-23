import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {TeamService} from "../OOP/services/TeamService";
// @ts-ignore
import styles from './CreateTeamPage.module.css';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {TeamAlreadyExistsError} from "../OOP/errors/TeamAlreadyExistsError";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";

type TeamColorType = 'homeColor' | 'awayColor';

// todo: check if exact same logo already exists (same file name and extension), if does, abort the creation, show an alert.

const CreateTeamPage = () => {

    const championships = useLocation().state.championships as Championship[];
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState({
        name: "",
        homeColor: { primary: "#000000", secondary: "#ffffff" },
        awayColor: { primary: "#ffffff", secondary: "#000000" },
        logo: null as File | null,
        championships: [] as Championship[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTeamData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setTeamData(prev => ({ ...prev, logo: e.target.files![0] }));
    };

    const handleColorChange = (type: TeamColorType, colorType: keyof ITeamColor, value: string) => {
        setTeamData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [colorType]: value
            }
        }));
    };

    const toggleChampionship = (championship: Championship) => {
        setTeamData(prev => ({
            ...prev,
            championships: prev.championships.includes(championship)
                ? prev.championships.filter(ch => ch.id !== championship.id)
                : [...prev.championships, championship]
        }));
    };

    const navigateHandler = () => navigate("/handleTeams");

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamData.name || !teamData.logo || teamData.championships.length === 0) {
            return alert("Please complete all required fields");
        }

        try {
            const team = new Team(
                teamData.name,
                "",
                teamData.homeColor,
                teamData.awayColor,
                teamData.championships
            );
            await team.uploadLogo(teamData.logo);
            await TeamService.createTeam(team);
            alert("Team created successfully!");
            navigateHandler();
        } catch (error) {
            if (error instanceof TeamAlreadyExistsError) {
                alert(error.message); // Specific error for duplicate names
            } else {
                alert("Team creation failed");
            }
        }
    };

    return (
        <form onSubmit={submitHandler}>
            <div>
                <label>Team name:</label>
                <input
                    type="text"
                    name="name"
                    value={teamData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label>Team logo:</label>
                <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleLogoChange}
                    required
                />
            </div>

            <div>
                <label>Home colors:</label>
                <div>
                    <div>
                        <p>Primary</p>
                        <input
                            type="color"
                            value={teamData.homeColor.primary}
                            onChange={(e) => handleColorChange('homeColor', 'primary', e.target.value)}
                        />
                    </div>
                    <div>
                        <p>Secondary</p>
                        <input
                            type="color"
                            value={teamData.homeColor.secondary}
                            onChange={(e) => handleColorChange('homeColor', 'secondary', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label>Away colors:</label>
                <div>
                    <div>
                        <p>Primary</p>
                        <input
                            type="color"
                            value={teamData.awayColor.primary}
                            onChange={(e) => handleColorChange('awayColor', 'primary', e.target.value)}
                        />
                    </div>
                    <div>
                        <p>Secondary</p>
                        <input
                            type="color"
                            value={teamData.awayColor.secondary}
                            onChange={(e) => handleColorChange('awayColor', 'secondary', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label>Championship:</label>
                {championships.map(ch => (
                    <div key={ch.id}>
                        <input
                            type="checkbox"
                            checked={teamData.championships.includes(ch)}
                            onChange={() => toggleChampionship(ch)}
                        />
                        <span>{ch.name}</span>
                    </div>
                ))}
            </div>

            <button type="submit">Create team</button>
            <button type="button" onClick={navigateHandler}>Go back</button>
        </form>
    );
};

export default CreateTeamPage;
