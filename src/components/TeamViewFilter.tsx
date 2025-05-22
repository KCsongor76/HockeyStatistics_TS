import React from 'react';
// @ts-ignore
import styles from '../pages/PreviousGameDetailPage.module.css';
import FilterButton from './FilterButton';

interface TeamViewFilterProps {
    selectedView: 'all' | 'home' | 'away';
    setSelectedView: (view: 'all' | 'home' | 'away') => void;
}

const TeamViewFilter = ({ selectedView, setSelectedView }: TeamViewFilterProps) => (
    <div className={styles.filterGroup}>
        <h3 className={styles.filterTitle}>Team View</h3>
        <div className={styles.buttonGroup}>
            <FilterButton
                label="All Teams"
                isActive={selectedView === 'all'}
                onClick={() => setSelectedView('all')}
            />
            <FilterButton
                label="Home Team"
                isActive={selectedView === 'home'}
                onClick={() => setSelectedView('home')}
            />
            <FilterButton
                label="Away Team"
                isActive={selectedView === 'away'}
                onClick={() => setSelectedView('away')}
            />
        </div>
    </div>
);

export default TeamViewFilter;