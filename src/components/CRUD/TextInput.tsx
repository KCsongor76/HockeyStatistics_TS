// src/components/TextInput.tsx
import React from 'react';

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
    <div>
        <label htmlFor={id || 'text-input'}>{label}</label>
        <input
            id={id || 'text-input'}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
        />
        {error && <span>{error}</span>}
    </div>
);