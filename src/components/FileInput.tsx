// src/components/FileInput.tsx
import React from 'react';

interface FileInputProps {
    label: string;
    onChange: (file: File | null) => void;
    accept?: string;
    error?: string;
    required?: boolean;
}

export const FileInput: React.FC<FileInputProps> = ({
                                                        label,
                                                        onChange,
                                                        accept = 'image/jpeg,image/png',
                                                        error,
                                                        required = false
                                                    }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
        } else {
            onChange(null);
        }
    };

    return (
        <div>
            <label>{label}</label>
            <input
                type="file"
                accept={accept}
                onChange={handleChange}
                required={required}
            />
            {error && <span>{error}</span>}
        </div>
    );
};