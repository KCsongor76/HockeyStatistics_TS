import React, { useState, useEffect } from 'react';
import {CustomButton} from "./CustomButton";
import {GameType} from "../OOP/enums/GameType";
import {PlayoffPeriod, RegularPeriod} from "../OOP/enums/Period";
import {IGame} from "../OOP/interfaces/IGame";
import {ActionType} from "../OOP/enums/ActionType";
// @ts-ignore
import styles from "./GameFilters.module.css"

interface GameFiltersProps {
    gameData: IGame;
    isTimeFilterActive: boolean;
    onTeamViewChange: (teamView: "all" | "home" | "away") => void;
    onPeriodsChange: (periods: Set<number>) => void;
    onActionTypesChange: (actionTypes: Set<ActionType>) => void;
    initialTeamView?: "all" | "home" | "away";
    initialPeriods?: Set<number>;
    initialActionTypes?: Set<ActionType>;
}

const GameFilters: React.FC<GameFiltersProps> = ({
                                                     gameData,
                                                     isTimeFilterActive,
                                                     onTeamViewChange,
                                                     onPeriodsChange,
                                                     onActionTypesChange,
                                                     initialTeamView = "all",
                                                     initialPeriods = new Set(Object.values(RegularPeriod) as number[]),
                                                     initialActionTypes = new Set(Object.values(ActionType))
                                                 }) => {
    const [selectedTeamView, setSelectedTeamView] = useState<"all" | "home" | "away">(initialTeamView);
    const [selectedPeriods, setSelectedPeriods] = useState<Set<number>>(initialPeriods);
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(initialActionTypes);

    const availablePeriods = Array.from(new Set(gameData.actions.map(action => action.period)));
    const availableActionTypes = Array.from(new Set(gameData.actions.map(action => action.type)));

    useEffect(() => {
        onTeamViewChange(selectedTeamView);
    }, [selectedTeamView, onTeamViewChange]);

    useEffect(() => {
        onPeriodsChange(selectedPeriods);
    }, [selectedPeriods, onPeriodsChange]);

    useEffect(() => {
        onActionTypesChange(selectedActionTypes);
    }, [selectedActionTypes, onActionTypesChange]);

    const togglePeriod = (period: number) => {
        const newPeriods = new Set(selectedPeriods);
        newPeriods.has(period) ? newPeriods.delete(period) : newPeriods.add(period);
        setSelectedPeriods(newPeriods);
    };

    const toggleActionType = (type: ActionType) => {
        const newTypes = new Set(selectedActionTypes);
        newTypes.has(type) ? newTypes.delete(type) : newTypes.add(type);
        setSelectedActionTypes(newTypes);
    };

    const getPeriodLabel = (period: number) => {
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
        <div className={styles.container}>
            <div>
                <h3>Team View</h3>
                <div className={styles.filtersSection}>
                    <CustomButton
                        type="neutral"
                        onClick={() => setSelectedTeamView('all')}
                        active={selectedTeamView === 'all'}
                    >
                        All Teams
                    </CustomButton>
                    <CustomButton
                        type="neutral"
                        onClick={() => setSelectedTeamView('home')}
                        active={selectedTeamView === 'home'}
                    >
                        Home Team
                    </CustomButton>
                    <CustomButton
                        type="neutral"
                        onClick={() => setSelectedTeamView('away')}
                        active={selectedTeamView === 'away'}
                    >
                        Away Team
                    </CustomButton>
                </div>
            </div>

            <div>
                <h3>Periods</h3>
                <div className={styles.filtersSection}>
                    {availablePeriods.map((period) => (
                        <CustomButton
                            key={period}
                            type={'neutral'}
                            onClick={() => togglePeriod(period)}
                            disabled={isTimeFilterActive}
                            active={selectedPeriods.has(period)}
                        >
                            {getPeriodLabel(period)}
                        </CustomButton>
                    ))}
                </div>
            </div>

            <div>
                <h3>Action Types</h3>
                <div className={styles.filtersSection}>
                    {availableActionTypes.map((type) => (
                        <CustomButton
                            key={type}
                            type={'neutral'}
                            onClick={() => toggleActionType(type)}
                            active={selectedActionTypes.has(type)}
                        >
                            {type}
                        </CustomButton>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameFilters;