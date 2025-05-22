import React from 'react';

// @ts-ignore
import styles from '../pages/PreviousGamesPage.module.css';
import {GameType} from "../OOP/enums/GameType";
import {ITeam} from "../OOP/interfaces/ITeam";
import {IChampionship} from "../OOP/interfaces/IChampionship";

interface FilterControlsProps {
    teams: ITeam[];
    championships: IChampionship[];
    homeTeamFilter: string;
    awayTeamFilter: string;
    championshipFilter: string;
    gameTypeFilter: string;
    sortOrder: string;
    itemsPerPage: number;
    onHomeTeamChange: (value: string) => void;
    onAwayTeamChange: (value: string) => void;
    onChampionshipChange: (value: string) => void;
    onGameTypeChange: (value: string) => void;
    onSortOrderChange: (value: string) => void;
    onItemsPerPageChange: (value: number) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
                                                           teams,
                                                           championships,
                                                           homeTeamFilter,
                                                           awayTeamFilter,
                                                           championshipFilter,
                                                           gameTypeFilter,
                                                           sortOrder,
                                                           itemsPerPage,
                                                           onHomeTeamChange,
                                                           onAwayTeamChange,
                                                           onChampionshipChange,
                                                           onGameTypeChange,
                                                           onSortOrderChange,
                                                           onItemsPerPageChange
                                                       }) => {
    return (
        <div className={styles.controlsContainer}>
            <SelectFilter
                value={homeTeamFilter}
                onChange={onHomeTeamChange}
                options={teams}
                placeholder="All Home Teams"
            />

            <SelectFilter
                value={awayTeamFilter}
                onChange={onAwayTeamChange}
                options={teams}
                placeholder="All Away Teams"
            />

            <SelectFilter
                value={championshipFilter}
                onChange={onChampionshipChange}
                options={championships}
                placeholder="All Championships"
            />

            <select
                className={styles.selectFilter}
                value={gameTypeFilter}
                onChange={(e) => onGameTypeChange(e.target.value)}
            >
                <option value="">All types</option>
                <option value={GameType.REGULAR}>{GameType.REGULAR}</option>
                <option value={GameType.PLAYOFF}>{GameType.PLAYOFF}</option>
            </select>

            <select
                className={styles.selectFilter}
                value={sortOrder}
                onChange={(e) => onSortOrderChange(e.target.value)}
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
            </select>

            <select
                className={styles.selectFilter}
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={75}>75 per page</option>
                <option value={100}>100 per page</option>
            </select>
        </div>
    );
};

interface SelectFilterProps<T> {
    value: string;
    onChange: (value: string) => void;
    options: T[];
    placeholder: string;
}

const SelectFilter = <T extends { id: string; name: string }>({
                                                                  value,
                                                                  onChange,
                                                                  options,
                                                                  placeholder
                                                              }: SelectFilterProps<T>) => {
    return (
        <select
            className={styles.selectFilter}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">{placeholder}</option>
            {options.map(option => (
                <option key={option.id} value={option.id}>
                    {option.name}
                </option>
            ))}
        </select>
    );
};

export default FilterControls;