import React from 'react';
import {ActionType} from "../OOP/enums/ActionType";
// @ts-ignore
import styles from './PlayerSelectorModal.module.css';
import {GameAction} from "../OOP/classes/GameAction";
import {Player} from "../OOP/classes/Player";
import {TeamWithRoster} from "../OOP/classes/TeamWithRoster";

interface PlayerSelectorModalProps {
    selectedAction: { type: ActionType; team: TeamWithRoster } | null;
    selectedPosition: { x: number; y: number } | null;
    period: number;
    time: number;
    onActionComplete: (newAction: GameAction) => void;
    onCancel: () => void;
}

const PlayerSelectorModal: React.FC<PlayerSelectorModalProps> = ({
                                                                     selectedAction,
                                                                     selectedPosition,
                                                                     period,
                                                                     time,
                                                                     onActionComplete,
                                                                     onCancel
                                                                 }) => {
    if (!selectedAction || !selectedPosition) return null;

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
            <div className={styles.playerModalContent}>
                <h3>Select Player</h3>
                {selectedAction.team.roster.map((player) => (
                    <button
                        key={player.id}
                        className={styles.playerButton}
                        onClick={() => {
                            // const newAction: GameAction = {
                            //     type: selectedAction.type,
                            //     team: selectedAction.team,
                            //     period,
                            //     time,
                            //     player: player as unknown as Player,
                            //     x: selectedPosition.x,
                            //     y: selectedPosition.y
                            // };
                            const newAction = new GameAction(
                                selectedAction.type,
                                selectedAction.team,
                                player as unknown as Player,
                                period,
                                time,
                                selectedPosition.x,
                                selectedPosition.y
                            )
                            onActionComplete(newAction);
                        }}
                    >
                        {player.name} (#{player.jerseyNumber})
                    </button>
                ))}
                <button className={styles.cancelButton} onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default PlayerSelectorModal;