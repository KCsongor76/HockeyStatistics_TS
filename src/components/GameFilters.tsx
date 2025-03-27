import React from 'react';
import {ActionType} from "../OOP/enums/ActionType";
import {RegularPeriod, PlayoffPeriod} from "../OOP/enums/Period";
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';

interface GameFiltersProps {
    selectedTeamView: 'all' | 'home' | 'away';
    setSelectedTeamView: (view: 'all' | 'home' | 'away') => void;
    availablePeriods: (RegularPeriod | PlayoffPeriod)[];
    selectedPeriods: Set<RegularPeriod | PlayoffPeriod>;
    togglePeriod: (period: RegularPeriod | PlayoffPeriod) => void;
    availableActionTypes: ActionType[];
    selectedActionTypes: Set<ActionType>;
    toggleActionType: (type: ActionType) => void;
    isPeriodFilterDisabled?: boolean;
}

const GameFilters: React.FC<GameFiltersProps> = ({
                                                     selectedTeamView,
                                                     setSelectedTeamView,
                                                     availablePeriods,
                                                     selectedPeriods,
                                                     togglePeriod,
                                                     availableActionTypes,
                                                     selectedActionTypes,
                                                     toggleActionType,
                                                     isPeriodFilterDisabled
                                                 }) => {
    return (
        <div className={styles.filterSection}>
            <div className={styles.filterGroup}>
                <h3 className={styles.filterTitle}>Team View</h3>
                <div className={styles.buttonGroup}>
                    <button
                        className={`${styles.button} ${selectedTeamView === 'all' ? styles.buttonActive : ''}`}
                        onClick={() => setSelectedTeamView('all')}
                    >
                        All Teams
                    </button>
                    <button
                        className={`${styles.button} ${selectedTeamView === 'home' ? styles.buttonActive : ''}`}
                        onClick={() => setSelectedTeamView('home')}
                    >
                        Home Team
                    </button>
                    <button
                        className={`${styles.button} ${selectedTeamView === 'away' ? styles.buttonActive : ''}`}
                        onClick={() => setSelectedTeamView('away')}
                    >
                        Away Team
                    </button>
                </div>
            </div>

            <div className={styles.filterGroup}>
                <h3 className={styles.filterTitle}>Periods</h3>
                <div className={styles.buttonGroup}>
                    {availablePeriods.map((period) => (
                        <button
                            key={period}
                            className={`${styles.periodButton} ${
                                selectedPeriods.has(period) ? styles.periodButtonActive : ''
                            }`}
                            onClick={() => togglePeriod(period)}
                            disabled={isPeriodFilterDisabled}
                        >
                            Period {period}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.filterGroup}>
                <h3 className={styles.filterTitle}>Action Types</h3>
                <div className={styles.buttonGroup}>
                    {availableActionTypes.map((type) => (
                        <button
                            key={type}
                            className={`${styles.periodButton} ${
                                selectedActionTypes.has(type) ? styles.periodButtonActive : ''
                            }`}
                            onClick={() => toggleActionType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameFilters; 