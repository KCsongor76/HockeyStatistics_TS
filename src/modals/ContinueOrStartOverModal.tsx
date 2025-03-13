import React from 'react';
// @ts-ignore
import styles from './ContinueOrStartOverModal.module.css';

interface ContinueOrStartOverModalProps {
    onContinue: () => void;
    onStartOver: () => void;
}

const ContinueOrStartOverModal: React.FC<ContinueOrStartOverModalProps> = ({ onContinue, onStartOver }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>Do you want to start a new game or continue with the previous one?</h3>
                <div className={styles.buttonGroup}>
                    <button className={styles.continueButton} onClick={onContinue}>Continue</button>
                    <button className={styles.startOverButton} onClick={onStartOver}>Start Over</button>
                </div>
            </div>
        </div>
    );
};

export default ContinueOrStartOverModal;