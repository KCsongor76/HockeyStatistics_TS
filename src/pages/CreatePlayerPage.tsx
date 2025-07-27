import React, {useState, useEffect} from 'react';
import {Position} from "../OOP/enums/Position";
import {TeamService} from "../OOP/services/TeamService";
import {useLoaderData, useNavigate} from "react-router-dom";
// @ts-ignore
import styles from './CreatePlayerPage.module.css';
import {Team} from "../OOP/classes/Team";
import {Player} from "../OOP/classes/Player";

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

    return (
        <form onSubmit={submitHandler}>
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={playerData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div>
                <label>Position:</label>
                <select
                    name="position"
                    value={playerData.position}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                >
                    {Object.values(Position).map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Jersey Number:</label>
                <input
                    type="number"
                    name="jerseyNumber"
                    value={playerData.jerseyNumber}
                    min={1}
                    max={99}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                />
                {errors.jerseyNumber && <span className={styles.error}>{errors.jerseyNumber}</span>}
            </div>

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
                <div>
                    <label>Team:</label>
                    <select
                        name="teamId"
                        value={playerData.teamId}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting || teams.length === 0}
                    >
                        {teams.length === 0 ? (
                            <option value="">Loading teams...</option>
                        ) : (
                            teams
                                .filter(team => team.id !== 'free-agent')
                                .map((team) => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))
                        )}
                    </select>
                </div>
            )}

            {errors.general && <span className={styles.error}>{errors.general}</span>}

            <button
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : 'Create'}
            </button>

            <button
                type="button"
                onClick={goBackHandler}
                disabled={isSubmitting}
            >
                Go back
            </button>
        </form>
    );
};

export default CreatePlayerPage;

export const loader = async () => {
    return await TeamService.getAllTeams();
};