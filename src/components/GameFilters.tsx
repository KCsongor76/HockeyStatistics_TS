import React from 'react';
import {CustomButton} from "./CustomButton";
import {GameType} from "../OOP/enums/GameType";
import {PlayoffPeriod, RegularPeriod} from "../OOP/enums/Period";
import {IGame} from "../OOP/interfaces/IGame";
import {ActionType} from "../OOP/enums/ActionType";

interface GameFiltersProps {
    gameData: IGame;
    availablePeriods: number[];
    availableActionTypes: ActionType[];
    isTimeFilterActive: boolean;
    setSelectedTeamView: (value: React.SetStateAction<"all" | "home" | "away">) => void;
    togglePeriod: (period: number) => void;
    toggleActionType: (type: ActionType) => void;
}

const GameFilters: React.FC<GameFiltersProps> = ({gameData, availablePeriods, availableActionTypes, isTimeFilterActive, setSelectedTeamView, togglePeriod, toggleActionType}: GameFiltersProps) => {
    return (
        <div>
            <div>
                <h3>Team View</h3>
                <div>
                    <CustomButton type={'neutral'} onClick={() => setSelectedTeamView('all')}>All Teams</CustomButton>
                    <CustomButton type={'neutral'} onClick={() => setSelectedTeamView('home')}>Home Team</CustomButton>
                    <CustomButton type={'neutral'} onClick={() => setSelectedTeamView('away')}>Away Team</CustomButton>
                </div>
            </div>

            <div>
                <h3>Periods</h3>
                <div>
                    {availablePeriods.map((period) => {
                        const getPeriodLabel = () => {
                            if (gameData.type === GameType.REGULAR) {
                                switch (period) {
                                    case RegularPeriod.FIRST:
                                    case RegularPeriod.SECOND:
                                    case RegularPeriod.THIRD:
                                        return `Period ${period}`;
                                    case RegularPeriod.OT:
                                        return 'OT';
                                    case RegularPeriod.SO:
                                        return 'SO';
                                    default:
                                        return `Period ${period}`;
                                }
                            } else {
                                if (period <= PlayoffPeriod.THIRD) {
                                    return `Period ${period}`;
                                } else {
                                    const otNumber = period - PlayoffPeriod.THIRD;
                                    return `OT${otNumber}`;
                                }
                            }
                        };

                        return (
                            <CustomButton
                                key={period}
                                type={'neutral'}
                                onClick={() => togglePeriod(period)}
                                disabled={isTimeFilterActive}
                            >
                                {getPeriodLabel(period)}
                            </CustomButton>
                        )
                    })}
                </div>
            </div>

            <div>
                <h3>Action Types</h3>
                <div>
                    {availableActionTypes.map((type) => (
                        <CustomButton
                            key={type}
                            type={'neutral'}
                            onClick={() => toggleActionType(type)}>
                            {type}
                        </CustomButton>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameFilters; 