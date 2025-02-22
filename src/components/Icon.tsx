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
    onClick?: () => void;
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
    };

    const shapeStyle = {
        ...style,
        borderRadius: type === ActionType.SHOT ? '50%' : type === ActionType.GOAL ? '12px' : '0',
        transform: type === ActionType.GOAL ? 'rotate(45deg)' : 'none'
    };

    return (
        <div style={shapeStyle} onClick={onClick}>
            <div style={{transform: type === ActionType.GOAL ? 'rotate(-45deg)' : 'none'}}>
                {type[0]}
            </div>
        </div>
    );
};

export default Icon;