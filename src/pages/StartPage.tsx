import React, {useState} from 'react';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {GameType} from "../OOP/enums/GameType";
import {ChampionshipService} from "../OOP/services/ChampionshipService";
import {TeamService} from "../OOP/services/TeamService";
import {useLoaderData} from "react-router-dom";

type FormState = {
    championship: Championship;
    homeTeam: Team;
    awayTeam: Team;
    gameType: GameType;
    color1: string;
    color2: string;
};

type LoaderData = {
    championships: Championship[];
    teams: Team[];
};

const StartPage: React.FC = () => {
    const loaderData = useLoaderData() as LoaderData;

    // Ensure that the data is defined before using it
    const championships = loaderData?.championships ?? [];
    const teams = loaderData?.teams ?? [];

    // Initialize state only when data is available
    const [formData, setFormData] = useState<FormState>({
        championship: championships[0] ?? new Championship(), // Provide a fallback to avoid undefined errors
        homeTeam: teams[0] ?? new Team(),
        awayTeam: teams[1] ?? teams[0] ?? new Team(),
        gameType: GameType.REGULAR,
        color1: '#000000',
        color2: '#ffffff',
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
    };

    if (championships.length === 0 || teams.length === 0) {
        return <div>Loading...</div>; // Handle loading or no data case
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="championship">Championship:</label>
                <select
                    id="championship"
                    name="championship"
                    value={formData.championship.name}
                    onChange={handleChange}
                >
                    {championships.map(championship => (
                        <option key={championship.id} value={JSON.stringify(championship)}>
                            {championship.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="homeTeam">Home Team:</label>
                <select
                    id="homeTeam"
                    name="homeTeam"
                    value={formData.homeTeam.name}
                    onChange={handleChange}
                >
                    {teams.map(team => (
                        <option key={team.id} value={JSON.stringify(team)}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="awayTeam">Away Team:</label>
                <select
                    id="awayTeam"
                    name="awayTeam"
                    value={formData.awayTeam.name}
                    onChange={handleChange}
                >
                    {teams.map(team => (
                        <option key={team.id} value={JSON.stringify(team)}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="gameType">Game Type:</label>
                <select
                    id="gameType"
                    name="gameType"
                    value={formData.gameType}
                    onChange={handleChange}
                >
                    <option value={GameType.REGULAR}>{GameType.REGULAR}</option>
                    <option value={GameType.PLAYOFF}>{GameType.PLAYOFF}</option>
                </select>
            </div>
            <div>
                <label htmlFor="color1">Color 1:</label>
                <input
                    type="color"
                    id="color1"
                    name="color1"
                    value={formData.color1}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="color2">Color 2:</label>
                <input
                    type="color"
                    id="color2"
                    name="color2"
                    value={formData.color2}
                    onChange={handleChange}
                />
            </div>
            <button type="submit">Start the Game!</button>
        </form>
    );
};

export default StartPage;

export const loader = async () => {
    const championships = await new ChampionshipService().list();
    const teams = await new TeamService().list();
    return {championships, teams};
};
