import React from 'react';
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';

interface FilterButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}

const FilterButton = ({ label, isActive, onClick, disabled }: FilterButtonProps) => (
    <button
        className={`${styles.periodButton} ${isActive ? styles.periodButtonActive : ''}`}
        onClick={onClick}
        disabled={disabled}
    >
        {label}
    </button>
);

export default FilterButton;