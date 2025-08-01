// RinkWithIcons.tsx
import React from 'react';
import {IGameAction} from "../OOP/interfaces/IGameAction";

interface RinkWithIconsProps {
    imageRef: React.RefObject<HTMLImageElement>;
    src: string;
    filteredActions: IGameAction[];
    handleIconClick: (action: IGameAction, e: React.MouseEvent) => void;
    iconSize?: number;
}

const RinkWithIcons: React.FC<RinkWithIconsProps> = ({
                                                         imageRef,
                                                         src,
                                                         filteredActions,
                                                         handleIconClick,
                                                         iconSize = 30
                                                     }) => {
    return (
        <div>
            <img
                ref={imageRef}
                src={src}
                alt="Rink"
            />
            {filteredActions.map((action, index) => (
                <div key={index} onClick={(e) => handleIconClick(action, e)}>
                    {action.type[0]}
                </div>
            ))}
        </div>
    );
};

export default RinkWithIcons;