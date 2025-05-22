import React from 'react';
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';
import FilterButton from './FilterButton';
import { GameType } from '../OOP/enums/GameType';
import {RegularPeriod} from "../OOP/enums/Period";

interface PeriodFilterProps {
    gameType: GameType;
    availablePeriods: number[];
    selectedPeriods: Set<number>;
    togglePeriod: (period: number) => void;
    isTimeFilterActive: boolean;
}

const PeriodFilter = ({
                          gameType,
                          availablePeriods,
                          selectedPeriods,
                          togglePeriod,
                          isTimeFilterActive
                      }: PeriodFilterProps) => {
    const getPeriodLabel = (period: number) => {
        if (gameType === GameType.REGULAR) {
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
        }
        return period <= 3 ? `Period ${period}` : `OT${period - 3}`;
    };

    return (
        <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Periods</h3>
            <div className={styles.buttonGroup}>
                {availablePeriods.map((period) => (
                    <FilterButton
                        key={period}
                        label={getPeriodLabel(period)}
                        isActive={selectedPeriods.has(period)}
                        onClick={() => togglePeriod(period)}
                        disabled={isTimeFilterActive}
                    />
                ))}
            </div>
        </div>
    );
};

export default PeriodFilter;