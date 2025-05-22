import React from 'react';
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';
import FilterButton from './FilterButton';
import { ActionType } from '../OOP/enums/ActionType';

interface ActionTypeFilterProps {
    availableActionTypes: ActionType[];
    selectedActionTypes: Set<ActionType>;
    toggleActionType: (type: ActionType) => void;
}

const ActionTypeFilter = ({
                              availableActionTypes,
                              selectedActionTypes,
                              toggleActionType
                          }: ActionTypeFilterProps) => (
    <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Action Types</h3>
        <div className={styles.buttonGroup}>
            {availableActionTypes.map((type) => (
                <FilterButton
                    key={type}
                    label={type}
                    isActive={selectedActionTypes.has(type)}
                    onClick={() => toggleActionType(type)}
                />
            ))}
        </div>
    </div>
);

export default ActionTypeFilter;