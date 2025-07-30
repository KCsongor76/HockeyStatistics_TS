import React from 'react';
import {CustomButton} from "./CustomButton";
import {Team} from "../OOP/classes/Team";
import {useNavigate} from "react-router-dom";
import {ITeam} from "../OOP/interfaces/ITeam";
// @ts-ignore
import styles from "./TeamCard.module.css"

interface TeamCardProps {
    team: Team;
    deleteHandler: (team: ITeam) => Promise<void>;
}

const TeamCard = ({team, deleteHandler}: TeamCardProps) => {
    const navigate = useNavigate();
    const viewNavigateHandler = () => {
        navigate(`${team.id}`, {state: {team}});
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.name}>{team.name}</div>
            </div>

            <div className={styles.championships}>
                {team.championships?.map((ch) => ch.name).join(", ") || "No championships"}
            </div>

            <div className={styles.actions}>
                <CustomButton
                    type="neutral"
                    onClick={() => viewNavigateHandler()}
                >
                    View
                </CustomButton>
                <CustomButton
                    type="negative"
                    onClick={() => deleteHandler(team)}
                >
                    Delete
                </CustomButton>
            </div>
        </div>
    );
};

export default TeamCard;