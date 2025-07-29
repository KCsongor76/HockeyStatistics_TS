// src/components/ColorPicker.tsx
import React from 'react';

interface ColorPickerProps {
    label: string;
    primaryColor: string;
    secondaryColor: string;
    onPrimaryChange: (color: string) => void;
    onSecondaryChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
                                                            label,
                                                            primaryColor,
                                                            secondaryColor,
                                                            onPrimaryChange,
                                                            onSecondaryChange
                                                        }) => (
    <div>
        <label>{label}</label>
        <div className="color-picker-group">
            <div>
                <p>Primary</p>
                <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => onPrimaryChange(e.target.value)}
                />
            </div>
            <div>
                <p>Secondary</p>
                <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => onSecondaryChange(e.target.value)}
                />
            </div>
        </div>
    </div>
);