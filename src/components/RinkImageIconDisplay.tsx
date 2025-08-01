import React from 'react';
import {IGameAction} from "../OOP/interfaces/IGameAction";

interface RinkImageIconDisplayProps {
    imageRef: React.RefObject<HTMLImageElement>;
    gameData: {
        selectedImage: string;
    };
    filteredActions: IGameAction[];
    handleIconClick: (action: IGameAction, e: React.MouseEvent<Element, MouseEvent>) => void;
    iconSize?: number;
    className?: string;
}

const RinkImageIconDisplay: React.FC<RinkImageIconDisplayProps> = ({
                                                                       imageRef,
                                                                       gameData,
                                                                       filteredActions,
                                                                       handleIconClick,
                                                                       iconSize = 30,
                                                                       className = ''
                                                                   }) => {
    return (
        <div>
            <img
                ref={imageRef}
                src={gameData.selectedImage}
                alt="gamePage"
            />
            {filteredActions.map((action, index) => (
                <div key={index} onClick={(e) => handleIconClick(action, e)}>
                    {action.type[0]}
                </div>
            ))}
        </div>
    );
};

export default RinkImageIconDisplay;