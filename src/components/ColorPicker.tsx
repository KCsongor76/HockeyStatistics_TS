// src/components/ColorPicker.tsx
import React from 'react';
// @ts-ignore
import styles from "./ColorPicker.module.css"

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
    <div className={styles.container}>
        <label className={styles.label}>{label}</label>
        <div className={styles.colorPickerGroup}>
            <div className={styles.colorGroup}>
                <p>Primary</p>
                <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => onPrimaryChange(e.target.value)}
                    className={styles.colorInput}
                />
            </div>
            <div className={styles.colorGroup}>
                <p>Secondary</p>
                <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => onSecondaryChange(e.target.value)}
                    className={styles.colorInput}
                />
            </div>
        </div>
    </div>
);