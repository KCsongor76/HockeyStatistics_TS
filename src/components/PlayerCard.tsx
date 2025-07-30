import React from 'react';
import {CustomButton} from "./CustomButton";
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";
import {useNavigate} from "react-router-dom";
// @ts-ignore
import styles from "./PlayerCard.module.css"

interface PlayerCardProps {
    player: Player;
    playerTeam: Team | undefined;
    deleteHandler: (player: Player) => Promise<void>;
}

const PlayerCard = ({player, playerTeam, deleteHandler}: PlayerCardProps) => {
    const navigate = useNavigate();

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.name}>{player.name}</div>
                <div className={styles.jerseyNumber}>#{player.jerseyNumber}</div>
            </div>

            <div className={styles.info}>
                <div>Position: {player.position}</div>
                <div>Team: {playerTeam?.name || 'Unknown'}</div>
            </div>

            <div className={styles.actions}>
                <CustomButton
                    type="neutral"
                    onClick={() => navigate(`${player.id}`, {state: {player}})}
                >
                    View
                </CustomButton>
                <CustomButton
                    type="negative"
                    onClick={() => deleteHandler(player)}
                >
                    Delete
                </CustomButton>
            </div>
        </div>
    );
};

export default PlayerCard;