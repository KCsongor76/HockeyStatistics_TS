import React, {useState, useEffect} from 'react';
import {Position} from "../OOP/enums/Position";
import {TeamService} from "../OOP/services/TeamService";
import {useLoaderData, useNavigate} from "react-router-dom";
// @ts-ignore
import styles from './CreatePlayerPage.module.css';
import {Team} from "../OOP/classes/Team";
import {Player} from "../OOP/classes/Player";
import {JerseyNumberInput} from '../components/JerseyNumberInput';
import {TextInput} from "../components/CRUD/TextInput";
import {Select} from "../components/CRUD/Select";
import {CustomButton} from "../components/CustomButton";

const CreatePlayerPage = () => {
    const loadedTeams = useLoaderData() as Team[] | undefined;
    const [teams, setTeams] = useState<Team[]>([]);
    const navigate = useNavigate();
    const [isFreeAgent, setIsFreeAgent] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [playerData, setPlayerData] = useState({
        name: '',
        position: Position.GOALIE,
        jerseyNumber: 1,
        teamId: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize teams and set default teamId
    useEffect(() => {
        if (loadedTeams && loadedTeams.length > 0) {
            setTeams(loadedTeams);
            setPlayerData(prev => ({
                ...prev,
                teamId: isFreeAgent ? "free-agent" : loadedTeams[0].id
            }));
        }
    }, [loadedTeams, isFreeAgent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setPlayerData(prev => ({
            ...prev,
            [name]: name === 'jerseyNumber' ? parseInt(value) || 0 : value
        }));
        setErrors({}) // Clear errors on change
    };

    const handleTextInputChange = (value: string, name: string) => {
        setPlayerData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors({});
    };

    const handleSelectChange = (value: string, name: string) => {
        setPlayerData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors({});
    };

    const handleJerseyNumberChange = (value: number | string) => {
        setPlayerData(prev => ({
            ...prev,
            jerseyNumber: typeof value === 'string' ? parseInt(value) || 0 : value
        }));
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        const trimmedName = playerData.name.trim();

        if (!trimmedName) {
            newErrors.name = 'Name is required';
        }

        if (isNaN(playerData.jerseyNumber)) {
            newErrors.jerseyNumber = 'Jersey number must be a number';
        } else if (playerData.jerseyNumber < 1 || playerData.jerseyNumber > 99) {
            newErrors.jerseyNumber = 'Jersey number must be between 1-99';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        if (isFreeAgent) {
            playerData.teamId = "free-agent";
        }

        try {
            if (!isFreeAgent && !await Player.isJerseyNumberAvailable(playerData.teamId, playerData.jerseyNumber)) {
                setErrors(prev => ({
                    ...prev,
                    jerseyNumber: `Jersey number ${playerData.jerseyNumber} is already taken`
                }));
                setIsSubmitting(false);
                return;
            }
            await Player.create(
                playerData.name.trim(),
                playerData.position,
                playerData.jerseyNumber,
                playerData.teamId
            );

            alert('Player created successfully!');
            // Reset form
            setPlayerData({
                name: '',
                position: Position.GOALIE,
                jerseyNumber: 1,
                teamId: teams.length > 0 ? teams[0].id : ''
            });
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                general: 'Failed to create player. Please try again.'
            }));
            console.error('Failed to create player:', error);
        } finally {
            setIsSubmitting(false);
            navigate("/handlePlayers")
        }
    };

    const goBackHandler = () => {
        navigate(-1);
    };

    const positionOptions = Object.values(Position).map(pos => ({
        value: pos,
        label: pos
    }));

    const teamOptions = teams
        .filter(team => team.id !== 'free-agent')
        .map(team => ({
            value: team.id,
            label: team.name
        }));

    return (
        <form onSubmit={submitHandler}>
            <TextInput
                label="Name:"
                value={playerData.name}
                onChange={(value: string) => handleTextInputChange(value, 'name')}
                disabled={isSubmitting}
                required
                error={errors.name}
            />

            <Select
                label="Position:"
                value={playerData.position}
                options={positionOptions}
                onChange={(value: string) => handleSelectChange(value, 'position')}
                disabled={isSubmitting}
                includeAll={false}
            />

            <JerseyNumberInput
                label="Jersey Number:"
                value={playerData.jerseyNumber}
                onChange={handleJerseyNumberChange}
                disabled={isSubmitting}
                error={errors.jerseyNumber}
            />

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={isFreeAgent}
                        onChange={() => setIsFreeAgent(!isFreeAgent)}
                        disabled={isSubmitting}
                    />
                    Free Agent
                </label>
            </div>

            {!isFreeAgent && (
                <Select
                    label="Team:"
                    value={playerData.teamId}
                    options={teamOptions}
                    onChange={(value: string) => handleSelectChange(value, 'teamId')}
                    disabled={isSubmitting || teams.length === 0}
                    includeAll={false}
                />
            )}

            {errors.general && <span className={styles.error}>{errors.general}</span>}

            <CustomButton type="positive" disabled={isSubmitting} buttonType="submit">
                {isSubmitting ? 'Creating...' : 'Create'}
            </CustomButton>

            <CustomButton type="negative" onClick={goBackHandler} disabled={isSubmitting}>
                Go back
            </CustomButton>
        </form>
    );
};

export default CreatePlayerPage;

export const loader = async () => {
    return await TeamService.getAllTeams();
};