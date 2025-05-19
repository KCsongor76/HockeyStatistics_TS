import React from 'react';
import {ActionType} from "../OOP/enums/ActionType";

interface IconProps {
    type: ActionType;
    teamType: 'HOME' | 'AWAY';
    teamColors: {
        primary: string;
        secondary: string;
    };
    size?: number;
    onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

const Icon = ({type, teamType, teamColors, size = 50, onClick}: IconProps) => {
    const style: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: teamColors.primary,
        color: teamColors.secondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        // border: '1px solid #000', // Hardcoded black border
    };

    const shapeStyle = {
        ...style,
        borderRadius: type === ActionType.SHOT ? '50%' : '0',
        clipPath: type === ActionType.GOAL
            ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            : 'none'
    };

    return (
        <div style={shapeStyle} onClick={onClick}>
            {type[0]}
        </div>
    );
};

export default Icon;