// src/components/JerseyNumberInput.tsx
import React from 'react';
// @ts-ignore
import styles from "./JerseyNumberInput.module.css"

interface JerseyNumberInputProps {
    label: string;
    value: number | string;
    onChange: (value: number | string) => void;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
}

export const JerseyNumberInput: React.FC<JerseyNumberInputProps> = ({
                                                                        label,
                                                                        value,
                                                                        onChange,
                                                                        disabled = false,
                                                                        error,
                                                                        placeholder = ""
                                                                    }) => (
    <div className={styles.container}>
        <label className={styles.label}>{label}</label>
        <input
            type="number"
            min={1}
            max={99}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={styles.input}
        />
        {error && <span className={styles.error}>{error}</span>}
    </div>
);