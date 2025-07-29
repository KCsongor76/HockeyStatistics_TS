// src/components/Select.tsx
import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    label?: string;
    includeAll?: boolean;
    allLabel?: string;
    allValue?: string;
    id?: string;
    disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
                                                  value,
                                                  options,
                                                  onChange,
                                                  label = "",
                                                  includeAll = true,
                                                  allLabel = 'All',
                                                  allValue = "",
                                                  id,
                                                  disabled = false
                                              }) => (
    <div>
        {label.length > 0 && <label htmlFor={id || 'select'}>{label}</label>}
        <select
            id={id || 'select'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        >
            {includeAll && <option value={allValue}>{allLabel}</option>}
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);