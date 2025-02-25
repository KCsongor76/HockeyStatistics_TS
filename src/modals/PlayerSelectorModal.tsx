import React from 'react';
import {ActionType} from "../OOP/enums/ActionType";
import {ITeam} from "../OOP/interfaces/ITeam";
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {IGameAction} from "../OOP/interfaces/IGameAction";
// @ts-ignore
import styles from './PlayerSelectorModal.module.css';

interface PlayerSelectorModalProps {
    selectedAction: { type: ActionType; team: ITeam } | null;
    selectedPosition: { x: number; y: number } | null;
    period: number;
    time: number;
    onActionComplete: (newAction: IGameAction) => void;
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
                {selectedAction.team.players.map((player) => (
                    <button
                        key={player.id}
                        className={styles.playerButton}
                        onClick={() => {
                            const newAction: IGameAction = {
                                type: selectedAction.type,
                                team: selectedAction.team,
                                period,
                                time,
                                player: player as unknown as IPlayer,
                                x: selectedPosition.x,
                                y: selectedPosition.y
                            };
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