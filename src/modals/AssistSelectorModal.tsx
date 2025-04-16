// AssistSelectorModal.tsx
import React, {useState} from 'react';
// @ts-ignore
import styles from './AssistSelectorModal.module.css';
import {Player} from "../OOP/classes/Player";

interface AssistSelectorModalProps {
    teamRoster: Player[];
    onAssistSelected: (assists: Player[]) => void;
    onCancel: () => void;
}

const AssistSelectorModal: React.FC<AssistSelectorModalProps> = ({
                                                                     teamRoster,
                                                                     onAssistSelected,
                                                                     onCancel
                                                                 }) => {
    const [selectedAssists, setSelectedAssists] = useState<Player[]>([]);

    const togglePlayer = (player: Player) => {
        const isSelected = selectedAssists.some(p => p.id === player.id);
        if (isSelected) {
            setSelectedAssists(prev => prev.filter(p => p.id !== player.id));
        } else if (selectedAssists.length < 2) {
            setSelectedAssists(prev => [...prev, player]);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalContent}>
                <h3>Select Assisting Players (0-2)</h3>
                {teamRoster.map((player) => (
                    <button
                        key={player.id}
                        className={`${styles.playerButton} ${
                            selectedAssists.some(p => p.id === player.id) ? styles.selected : ''
                        }`}
                        onClick={() => togglePlayer(player)}
                    >
                        {player.name} (#{player.jerseyNumber})
                    </button>
                ))}
                <div className={styles.buttonGroup}>
                    <button
                        className={styles.confirmButton}
                        onClick={() => onAssistSelected(selectedAssists)}
                    >
                        Confirm
                    </button>
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssistSelectorModal;