import React from 'react';
import {IGame} from "../OOP/interfaces/IGame";
import {IGameAction} from "../OOP/interfaces/IGameAction";

interface RinkImageIconDisplayProps {
    imageRef: React.RefObject<HTMLImageElement>
    gameData: IGame;
    filteredActions: IGameAction[];
    handleIconClick: (action: IGameAction, e?: React.MouseEvent<Element, MouseEvent>) => void;
}

const RinkImageIconDisplay = ({imageRef, gameData, filteredActions, handleIconClick}: RinkImageIconDisplayProps) => {
    return (
        <div>
            <img
                ref={imageRef}
                src={gameData.selectedImage}
                alt="gamePage"
            />
            {filteredActions.map((action, index) =>
                <div key={index} onClick={() => handleIconClick(action)}>{action.type[0]}</div>
            )}
        </div>
    );
};

export default RinkImageIconDisplay;