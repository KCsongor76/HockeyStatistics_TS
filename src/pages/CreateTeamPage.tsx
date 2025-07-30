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
import {TextInput} from "../components/CRUD/TextInput";
import {ColorPicker} from "../components/ColorPicker";
import {FileInput} from "../components/FileInput";
import {CustomButton} from "../components/CustomButton";

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

    const handleChange = (value: string) => {
        setTeamData(prev => ({...prev, name: value}));
    };

    const handleLogoChange = (file: File | null) => {
        if (!file) {
            setTeamData(prev => ({...prev, logo: null}));
            setErrors(prev => ({...prev, logo: ''}));
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setErrors(prev => ({...prev, logo: 'Only .jpg and .png formats are allowed'}));
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setErrors(prev => ({...prev, logo: 'File size should not exceed 10MB'}));
            return;
        }

        setTeamData(prev => ({...prev, logo: file}));
        setErrors(prev => ({...prev, logo: ''}));
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
        if (!logoFile) {
            setErrors(prev => ({...prev, logo: 'Logo is required'}));
            return;
        }

        try {
            const nameExists = await TeamService.checkNameExists(teamData.name);
            if (nameExists) {
                setErrors(prev => ({...prev, name: 'Team name already exists'}));
                return;
            }

            const logoExists = await TeamService.checkLogoExists(logoFile.name, true);
            if (logoExists) {
                setErrors(prev => ({...prev, logo: 'A team logo with the same file name already exists'}));
                return;
            }

            const team = new Team(
                teamData.name,
                "",
                teamData.homeColor,
                teamData.awayColor,
                teamData.seasons,
                teamData.championships
            );

            await team.uploadLogo(logoFile);
            await TeamService.createTeam(team);
            navigateHandler();

        } catch (error) {
            if (error instanceof TeamAlreadyExistsError) {
                // @ts-ignore
                setErrors(prev => ({...prev, name: error.message}));
            } else {
                setErrors(prev => ({...prev, general: 'Team creation failed. Please try again.'}));
                console.error("Team creation failed:", error);
            }
        }
    };

    return (
        <form onSubmit={submitHandler}>
            <TextInput
                label="Team name:"
                value={teamData.name}
                onChange={handleChange}
                required
                error={errors.name}
            />

            <FileInput
                label="Team logo:"
                onChange={handleLogoChange}
                required
                error={errors.logo}
            />

            <ColorPicker
                label={"Home colors"}
                primaryColor={teamData.homeColor.primary}
                secondaryColor={teamData.homeColor.secondary}
                onPrimaryChange={value => handleColorChange('homeColor', 'primary', value)}
                onSecondaryChange={value => handleColorChange('homeColor', 'secondary', value)}
            />

            <ColorPicker
                label={"Away colors"}
                primaryColor={teamData.awayColor.primary}
                secondaryColor={teamData.awayColor.secondary}
                onPrimaryChange={value => handleColorChange('awayColor', 'primary', value)}
                onSecondaryChange={value => handleColorChange('awayColor', 'secondary', value)}
            />

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

            <CustomButton type="positive" buttonType="submit">
                Create team
            </CustomButton>
            <CustomButton type="negative" onClick={navigateHandler}>
                Go back
            </CustomButton>
        </form>
    );
};

export default CreateTeamPage;