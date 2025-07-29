import React from 'react';
import {Player} from "../OOP/classes/Player";

interface RosterManagerProps {
    player: Player;
    isHome: boolean
    rosterHandler: (
        player: Player,
        isHome: boolean,
    ) => void
}

const RosterManager = ({player, /*isAdding,*/ isHome, rosterHandler}: RosterManagerProps) => {
    const text = rosterHandler.name === "addPlayerToRoster" ? "Add" : "Remove"

    return (
        <div key={player.id}>
            <span>{player.name}</span>
            <button
                type="button"
                onClick={() => rosterHandler(player, isHome/*, isAdding*/)}
            >
                {text}
            </button>
        </div>
    );
};

export default RosterManager;