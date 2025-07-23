import React, {useState, useEffect} from 'react';
import {Position} from "../OOP/enums/Position";
import {TeamService} from "../OOP/services/TeamService";
import {useLoaderData, useNavigate} from "react-router-dom";
import {PlayerService} from "../OOP/services/PlayerService";
// @ts-ignore
import styles from './CreatePlayerPage.module.css';
import {Team} from "../OOP/classes/Team";
import {Player} from "../OOP/classes/Player";

// todo: don't let the user create eg. player with #888...
// todo: handle empty values "server" side

const CreatePlayerPage = () => {
    const loadedTeams = useLoaderData() as Team[] | undefined;
    const [teams, setTeams] = useState<Team[]>([]);
    const navigate = useNavigate();
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
                teamId: loadedTeams[0].id
            }));
        }
    }, [loadedTeams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPlayerData(prev => ({
            ...prev,
            [name]: name === 'jerseyNumber' ? parseInt(value) : value
        }));
    };

    const submitHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            // Check for duplicate jersey number
            const existingPlayers = await PlayerService.getPlayersByTeam(playerData.teamId);
            const duplicatePlayer = existingPlayers.find(p =>
                p.jerseyNumber === playerData.jerseyNumber
            );

            if (duplicatePlayer) {
                alert(`Error: Jersey number ${playerData.jerseyNumber} is already used by ${duplicatePlayer.name}`);
                setIsSubmitting(false);
                return;
            }

            const player = new Player(
                playerData.name,
                playerData.position,
                playerData.jerseyNumber,
                playerData.teamId
            );

            await PlayerService.addPlayerToTeam(player.teamId, player);
            alert('Player created successfully!');
            setPlayerData({
                name: '',
                position: Position.GOALIE,
                jerseyNumber: 1,
                teamId: teams.length > 0 ? teams[0].id : ''
            });
        } catch (error) {
            console.error('Failed to create player:', error);
            alert('Failed to create player. Please try again.');
        } finally {
            setIsSubmitting(false);
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
            </div>

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
                        teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))
                    )}
                </select>
            </div>

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