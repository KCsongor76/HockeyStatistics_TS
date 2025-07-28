import React, {useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
// @ts-ignore
import styles from './CreateTeamPage.module.css';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {TeamAlreadyExistsError} from "../OOP/errors/TeamAlreadyExistsError";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import {Season} from "../OOP/enums/Season";
import {TeamService} from "../OOP/services/TeamService";

type TeamColorType = 'homeColor' | 'awayColor';

const CreateTeamPage = () => {

    const championships = useLocation().state.championships as Championship[];
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState({
        name: "",
        homeColor: {primary: "#000000", secondary: "#ffffff"},
        awayColor: {primary: "#ffffff", secondary: "#000000"},
        logo: null as File | null,
        seasons: [] as Season[],
        championships: [] as Championship[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setTeamData(prev => ({...prev, [name]: value}));
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
            setTeamData(prev => ({...prev, logo: e.target.files![0]}));
        }
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
        const newErrors: Record<string, string> = {};

        if (!teamData.name) newErrors.name = 'Name is required';
        if (!teamData.logo) newErrors.logo = 'Logo is required';
        if (teamData.championships.length === 0) newErrors.championships = 'At least one championship is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const logoFile = teamData.logo;
        // Additional null check to satisfy TypeScript
        if (!logoFile) {
            setErrors(prev => ({...prev, logo: 'Logo is required'}));
            return;
        }

        // Check for existing logo
        try {
            const exists = await TeamService.checkLogoExists(logoFile.name, true);
            if (exists) {
                alert("A team logo with the same file name already exists. Please choose a different file.");
                return;
            }
        } catch (error) {
            console.error("Error checking logo existence:", error);
            alert("Failed to check logo existence. Please try again.");
            return;
        }

        try {
            const team = new Team(
                teamData.name,
                "",
                teamData.homeColor,
                teamData.awayColor,
                teamData.seasons,
                teamData.championships
            );
            await team.uploadLogo(logoFile);
            console.log(team);
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
                {errors.name && <span>{errors.name}</span>}
            </div>

            <div>
                <label>Team logo:</label>
                <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleLogoChange}
                    required
                />
                {errors.logo && <span>{errors.logo}</span>}
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
                {errors.championships && <span>{errors.championships}</span>}
            </div>

            {errors.general && <span>{errors.general}</span>}

            <button type="submit">Create team</button>
            <button type="button" onClick={navigateHandler}>Go back</button>
        </form>
    );
};

export default CreateTeamPage;
