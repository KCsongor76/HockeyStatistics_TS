import React from 'react';
// @ts-ignore
import Modal from 'react-modal';

Modal.setAppElement("#root");

interface ContinueOrStartOverModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    onContinue: () => void;
    onStartOver: () => void;
}

const ContinueOrStartOverModal = ({isOpen, onRequestClose, onContinue, onStartOver}: ContinueOrStartOverModalProps) => {

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <h2>Continue or start over?</h2>
            <p>
                Are you sure you want to continue with the current game?
            </p>
            <button onClick={onContinue}>Continue</button>
            <button onClick={onStartOver}>Start over</button>
        </Modal>
    );
};

export default ContinueOrStartOverModal;