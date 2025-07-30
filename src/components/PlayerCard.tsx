import React from 'react';
import {CustomButton} from "./CustomButton";
import {Player} from "../OOP/classes/Player";
import {Team} from "../OOP/classes/Team";
import {useNavigate} from "react-router-dom";

interface PlayerCardProps {
    player: Player;
    playerTeam: Team | undefined;
    deleteHandler: (player: Player) => Promise<void>;
}

const PlayerCard = ({player, playerTeam, deleteHandler}: PlayerCardProps) => {
    const navigate = useNavigate();

    return (
        <div key={player.id}>
            <div>
                <div>{player.name}</div>
                <div>#{player.jerseyNumber}</div>
            </div>

            <div>
                <div>Position: {player.position}</div>
                <div>Team: {playerTeam?.name || 'Unknown'}</div>
            </div>

            <div>
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