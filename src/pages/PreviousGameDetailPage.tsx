import React, {useState} from 'react';
import {useLocation} from "react-router-dom";
import Icon from "../components/Icon";
import {GameAction} from "../OOP/classes/GameAction";
import {Game} from "../OOP/classes/Game";
import {ActionType} from "../OOP/enums/ActionType";
import {RegularPeriod, PlayoffPeriod} from "../OOP/enums/Period";
// @ts-ignore
import styles from './PreviousGameDetailPage.module.css';

const PreviousGameDetailPage = () => {
    const location = useLocation();
    const gameData = location.state as Game;

    console.log(gameData);

    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    console.log(selectedTeamView);
    const [selectedPeriods, setSelectedPeriods] = useState<Set<RegularPeriod | PlayoffPeriod>>(
        new Set(Object.values(RegularPeriod))
    );
    console.log(selectedPeriods);
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(
        new Set(Object.values(ActionType))
    );
    console.log(selectedActionTypes);
    const availablePeriods = [...new Set(gameData._actions.map(action => action._period))];
    console.log(availablePeriods);
    const availableActionTypes = [...new Set(gameData._actions.map(action => action._type))];
    console.log(availableActionTypes);

    const filteredActions = gameData._actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action._team.id === gameData._teams.home.id) ||
            (selectedTeamView === 'away' && action._team.id === gameData._teams.away.id);

        const periodFilter = selectedPeriods.has(action._period);
        const typeFilter = selectedActionTypes.has(action._type);

        return teamFilter && periodFilter && typeFilter;
    });

    const togglePeriod = (period: RegularPeriod | PlayoffPeriod) => {
        const newPeriods = new Set(selectedPeriods);
        if (newPeriods.has(period)) {
            newPeriods.delete(period);
        } else {
            newPeriods.add(period);
        }
        setSelectedPeriods(newPeriods);
    };

    const toggleActionType = (type: ActionType) => {
        const newTypes = new Set(selectedActionTypes);
        if (newTypes.has(type)) {
            newTypes.delete(type);
        } else {
            newTypes.add(type);
        }
        setSelectedActionTypes(newTypes);
    };

    return (
        <div className={styles.container}>
            <div className={styles.filterSection}>
                {/* Team View Selection */}
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

                {/* Period Selection */}
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
                            >
                                Period {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Type Selection */}
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

            {/* Game Visualization */}
            <div className={styles.gameVisualization}>
                <img
                    src={gameData._selectedImage}
                    alt="gamePage"
                    className={styles.gameImage}
                />
                {filteredActions.map((action: GameAction, index: number) => (
                    <div
                        key={index}
                        className={styles.actionIcon}
                        style={{
                            left: `${action._x * 100}%`,
                            top: `${action._y * 100}%`,
                        }}
                    >
                        <Icon
                            type={action._type}
                            teamType={action._team.id === gameData._teams.home.id ? 'HOME' : 'AWAY'}
                            teamColors={action._team.id === gameData._teams.home.id ? gameData._teams.home.homeColor : gameData._teams.away.homeColor}
                            size={30}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreviousGameDetailPage;