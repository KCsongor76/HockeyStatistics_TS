// src/components/TextInput.tsx
import React from 'react';
// @ts-ignore
import styles from "./TextInput.module.css"

interface TextInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string
}

export const TextInput: React.FC<TextInputProps> = ({
                                                        label,
                                                        value,
                                                        onChange,
                                                        placeholder = '',
                                                        type = 'text',
                                                        id,
                                                        required = false,
                                                        disabled = false,
                                                        error = ""
                                                    }) => (
    <div className={styles.container}>
        <label htmlFor={id || 'text-input'} className={styles.label}>{label}</label>
        <input
            id={id || 'text-input'}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            className={styles.input}
        />
        {error && <span className={styles.error}>{error}</span>}
    </div>
);