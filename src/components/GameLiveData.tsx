import React from 'react';

const GameLiveData = () => {
    return (
        <div>

        </div>
    );
};

export default GameLiveData;


// import React from 'react';
// import GameFilters from "./GameFilters";
// import RinkWithIcons from "./RinkWithIcons";
// import RinkImageIconDisplay from "./RinkImageIconDisplay";
// import PlayerStatsSection from "./PlayerStatsSection";
// import {IGame} from "../OOP/interfaces/IGame";
// import {ActionType} from "../OOP/enums/ActionType";
// import {IGameAction} from "../OOP/interfaces/IGameAction";
// import {IPlayer} from "../OOP/interfaces/IPlayer";
//
// interface GameFiltersProps {
//     gameData: IGame;
//     availablePeriods: number[];
//     availableActionTypes: ActionType[];
//     isTimeFilterActive: boolean;
//     setSelectedTeamView: (value: React.SetStateAction<"all" | "home" | "away">) => void;
//     togglePeriod: (period: number) => void;
//     toggleActionType: (type: ActionType) => void;
// }
//
// interface RinkWithIconsProps {
//     imageRef: React.RefObject<HTMLImageElement>;
//     src: string;
//     filteredActions: IGameAction[];
//     handleIconClick: (action: IGameAction, e: React.MouseEvent) => void;
//     iconSize?: number;
// }
//
// interface RinkImageIconDisplayProps {
//     imageRef: React.RefObject<HTMLImageElement>;
//     gameData: {
//         selectedImage: string;
//     };
//     filteredActions: IGameAction[];
//     handleIconClick: (action: IGameAction, e: React.MouseEvent<Element, MouseEvent>) => void;
//     iconSize?: number;
//     className?: string;
// }
//
// interface PlayerStatsSectionProps {
//     positionGroups: any;
//     handleSort: (column: keyof IPlayer) => void;
//     sortBy: keyof IPlayer;
//     sortOrder: "asc" | "desc";
//     selectedPlayer: string | null;
//     setSelectedPlayer: (value: React.SetStateAction<string | null>) => void
//     uniqueNonRoster: IPlayer[];
// }
//
// interface GameLiveDataProps {
//     gameData: IGame;
//     availablePeriods: number[];
//     availableActionTypes: ActionType[];
//     isTimeFilterActive: boolean;
//     setSelectedTeamView: (value: React.SetStateAction<"all" | "home" | "away">) => void;
//     togglePeriod: (period: number) => void;
//     toggleActionType: (type: ActionType) => void;
//
//     imageRef: React.RefObject<HTMLImageElement>;
//     src: string;
//     filteredActions: IGameAction[];
//     // handleIconClick: (action: IGameAction, e: React.MouseEvent) => void;
//     iconSize?: number;
//
//     handleIconClick: (action: IGameAction, e: React.MouseEvent<Element, MouseEvent>) => void;
//
//     positionGroups: any;
//     handleSort: (column: keyof IPlayer) => void;
//     sortBy: keyof IPlayer;
//     sortOrder: "asc" | "desc";
//     selectedPlayer: string | null;
//     setSelectedPlayer: (value: React.SetStateAction<string | null>) => void
//     uniqueNonRoster: IPlayer[];
// }
//
// const GameLiveData = ({}: any) => {
//     return (
//         <>
//             <GameFilters
//                 gameData={gameData}
//                 availablePeriods={availablePeriods}
//                 availableActionTypes={availableActionTypes}
//                 isTimeFilterActive={isTimeFilterActive}
//                 setSelectedTeamView={setSelectedTeamView}
//                 togglePeriod={togglePeriod}
//                 toggleActionType={toggleActionType}
//             />
//
//             <RinkWithIcons
//                 imageRef={imageRef} // todo
//                 src={gameData.selectedImage}
//                 filteredActions={filteredActions}
//                 handleIconClick={handleIconClick}
//             />
//
//             <RinkImageIconDisplay
//                 imageRef={imageRef} // todo
//                 src={gameData.selectedImage}
//                 filteredActions={filteredActions}
//                 handleIconClick={handleIconClick}
//                 iconSize={iconSize}
//             />
//
//             <h3>Player Statistics</h3>
//             <PlayerStatsSection
//                 positionGroups={positionGroups}
//                 handleSort={handleSort}
//                 sortBy={sortBy}
//                 sortOrder={sortOrder}
//                 selectedPlayer={selectedPlayer}
//                 setSelectedPlayer={setSelectedPlayer}
//                 uniqueNonRoster={uniqueNonRoster}
//             />
//         </>
//     );
// };
//
// export default GameLiveData;