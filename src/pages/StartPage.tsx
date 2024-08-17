import React, {useState} from 'react';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {GameType} from "../OOP/enums/GameType";
import {ChampionshipService} from "../OOP/services/ChampionshipService";
import {TeamService} from "../OOP/services/TeamService";
import {useLoaderData} from "react-router-dom";
import {ChampionshipInterface} from "../OOP/interfaces/ChampionshipInterface";

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

    console.log(loaderData);

    // Initialize state only when data is available
    const [formData, setFormData] = useState<FormState>({
        championship: championships[0] ?? new Championship(), // Provide a fallback to avoid undefined errors
        homeTeam: teams[0] ?? new Team(),
        awayTeam: teams[1] ?? teams[0] ?? new Team(),
        gameType: GameType.REGULAR,
        color1: '#000000',
        color2: '#ffffff',
    });

    if (championships.length === 0 || teams.length === 0) {
        return <div>Loading...</div>; // Handle loading or no data case
    }

    return (
        <div>Loading...</div>
    );
};

export default StartPage;

export const loader = async () => {
    const championships = await ChampionshipService.getAllChampionships();
    const teams = await TeamService.getAllTeams();
    return {championships, teams};
};
