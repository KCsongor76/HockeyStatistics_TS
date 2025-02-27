import React, {useState} from 'react';
import {useLocation} from "react-router-dom";
import Icon from "../components/Icon";
import {ActionType} from "../OOP/enums/ActionType";
import {RegularPeriod, PlayoffPeriod} from "../OOP/enums/Period";
// @ts-ignore
import styles from './PreviousGameDetailPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";
import {IGameAction} from "../OOP/interfaces/IGameAction";
import IconDataModal from "../modals/IconDataModal";

// todo: css - middle, rink, max width
// todo: delete handler?
// todo: filter by players, return statistics like - team/player stats, best stats

const PreviousGameDetailPage = () => {
    const location = useLocation();
    const gameData = location.state as IGame;
    console.log(gameData);

    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    type Period = RegularPeriod | PlayoffPeriod;
    const [selectedPeriods, setSelectedPeriods] = useState<Set<Period>>(new Set(Object.values(RegularPeriod) as Period[]));
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(new Set(Object.values(ActionType)));
    const availablePeriods = Array.from(new Set(gameData.actions.map(action => action.period)));
    const availableActionTypes = Array.from(new Set(gameData.actions.map(action => action.type)));
    const filteredActions = gameData.actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action.team.id === gameData.teams.home.id) ||
            (selectedTeamView === 'away' && action.team.id === gameData.teams.away.id);

        const periodFilter = selectedPeriods.has(action.period);
        const typeFilter = selectedActionTypes.has(action.type);

        return teamFilter && periodFilter && typeFilter;
    });

    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);

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

    const handleIconClick = (action: IGameAction) => {
        setSelectedActionDetails(action);
    };

    const handleCloseIconData = () => {
        setSelectedActionDetails(null);
    };

    return (
        <div className={styles.container}>
            {selectedActionDetails && (
                <IconDataModal
                    action={selectedActionDetails}
                    onClose={handleCloseIconData}
                />
            )}
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
                    src={gameData.selectedImage}
                    alt="gamePage"
                    className={styles.gameImage}
                />
                {filteredActions.map((action: IGameAction, index: number) => (
                    <div
                        key={index}
                        className={styles.actionIcon}
                        style={{
                            left: `${action.x * 100}%`,
                            top: `${action.y * 100}%`,
                        }}
                    >
                        <Icon
                            type={action.type}
                            teamType={action.team.id === gameData.teams.home.id ? 'HOME' : 'AWAY'}
                            teamColors={action.team.id === gameData.teams.home.id ? gameData.teams.home.homeColor : gameData.teams.away.homeColor}
                            size={30}
                            onClick={() => handleIconClick(action)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreviousGameDetailPage;