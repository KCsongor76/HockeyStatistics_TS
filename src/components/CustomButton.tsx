import React from 'react';
// @ts-ignore
import styles from './CustomButton.module.css';

type ButtonType = 'positive' | 'neutral' | 'negative';

interface CustomButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: ButtonType;
    disabled?: boolean;
    buttonType?: 'button' | 'submit' | 'reset';
    active?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
                                                              children,
                                                              onClick,
                                                              type = 'neutral',
                                                              disabled = false,
                                                              buttonType = 'button',
                                                              active = false
                                                          }) => {
    const buttonClass = `${styles.button} ${styles[type]} ${active ? styles.active : ''}`;

    return (
        <button
            type={buttonType}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};