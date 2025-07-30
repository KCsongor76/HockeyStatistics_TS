import React from 'react';
import {Player} from "../OOP/classes/Player";
// @ts-ignore
import styles from "./RosterManager.module.css"

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
        <div className={styles.container}>
            <span className={styles.playerName}>{player.name}</span>
            <button
                type="button"
                className={styles.button}
                onClick={() => rosterHandler(player, isHome)}
            >
                {text}
            </button>
        </div>
    );
};

export default RosterManager;