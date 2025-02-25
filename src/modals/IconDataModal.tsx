import React from 'react';
import {ActionType} from "../OOP/enums/ActionType";
import {IGameAction} from "../OOP/interfaces/IGameAction";
import {ITeam} from "../OOP/interfaces/ITeam";
// @ts-ignore
import styles from './IconDataModal.module.css';

interface IconDataModalProps {
    action: IGameAction | null;
    onClose: () => void;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const IconDataModal = ({action, onClose}: IconDataModalProps) => {
    if (!action) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.modalTitle}>Action Details</h3>

                <div className={styles.detailItem}>
                    <label>Team:</label>
                    <span>{(action.team as ITeam).name}</span>
                </div>

                <div className={styles.detailItem}>
                    <label>Player:</label>
                    <span>{action.player?.name || 'Unknown Player'}</span>
                </div>

                <div className={styles.detailItem}>
                    <label>Action Type:</label>
                    <span>{action.type}</span>
                </div>

                <div className={styles.detailItem}>
                    <label>Period:</label>
                    <span>{action.period}</span>
                </div>

                <div className={styles.detailItem}>
                    <label>Time:</label>
                    <span>{formatTime(action.time)}</span>
                </div>

                <button className={styles.closeButton} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default IconDataModal;