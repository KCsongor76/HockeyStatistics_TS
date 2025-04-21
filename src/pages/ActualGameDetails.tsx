import React, {useState, useEffect, useRef} from 'react';
import {ActionType} from "../OOP/enums/ActionType";
import {RegularPeriod, PlayoffPeriod} from "../OOP/enums/Period";
// @ts-ignore
import ReactSlider from 'react-slider';
import {IGame} from "../OOP/interfaces/IGame";
import {IGameAction} from "../OOP/interfaces/IGameAction";
import IconDataModal from "../modals/IconDataModal";
import {IPlayer} from "../OOP/interfaces/IPlayer";
// @ts-ignore
import styles from "./PreviousGameDetailPage.module.css";
import Icon from "../components/Icon";

const ActualGameDetails = ({gameData}: { gameData: IGame }) => {

    const fieldImageRef = useRef<HTMLImageElement>(null);
    const [iconSize, setIconSize] = useState(30);
    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    type Period = RegularPeriod | PlayoffPeriod;
    const [selectedPeriods, setSelectedPeriods] = useState<Set<Period>>(new Set(Object.values(RegularPeriod) as Period[]));
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(new Set(Object.values(ActionType)));
    const [sortBy, setSortBy] = useState<keyof IPlayer>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);
    const [zoneFilter, setZoneFilter] = useState<{ x: [number, number], y: [number, number] }>({
        x: [0, 100],
        y: [0, 100]
    });
    const [timeFilter, setTimeFilter] = useState<[number, number]>([0, 3600]);

    const availablePeriods = Array.from(new Set(gameData.actions.map(action => action.period)));
    const availableActionTypes = Array.from(new Set(gameData.actions.map(action => action.type)));
    const minTime = 0;
    const maxTime = Math.max(...gameData.actions.map(a => a.time * 60), 3600);
    const isTimeFilterActive = timeFilter[0] > minTime || timeFilter[1] < maxTime;

    const filteredActions = gameData.actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action.team.id === gameData.teams.home.id) ||
            (selectedTeamView === 'away' && action.team.id === gameData.teams.away.id);
        const periodFilter = selectedPeriods.has(action.period);
        const typeFilter = selectedActionTypes.has(action.type);
        const playerFilter = !selectedPlayer || action.player.id === selectedPlayer;
        const zoneXFilter = action.x * 100 >= zoneFilter.x[0] && action.x * 100 <= zoneFilter.x[1];
        const zoneYFilter = action.y * 100 >= zoneFilter.y[0] && action.y * 100 <= zoneFilter.y[1];
        const actionTimeSeconds = action.time * 60;
        const timeFilterPass = actionTimeSeconds >= timeFilter[0] && actionTimeSeconds <= timeFilter[1];

        return teamFilter && periodFilter && typeFilter && playerFilter &&
            zoneXFilter && zoneYFilter && timeFilterPass;
    });


    // ... Include other functions like togglePeriod, toggleActionType, handleSort, etc. from PreviousGameDetailPage

    const updateIconSize = () => {
        if (fieldImageRef.current) {
            const imageWidth = fieldImageRef.current.offsetWidth;
            // Calculate icon size as a percentage of image width (3% in this example)
            const newSize = Math.max(Math.floor(imageWidth * 0.03), 20);
            setIconSize(newSize);
        }
    };

    const handleSort = (column: keyof IPlayer) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

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

    const getPlayerStats = (players: IPlayer[], teamId: string) => {
        return players.map(player => {
            const playerActions = gameData.actions.filter(a =>
                a.player.id === player.id &&
                (teamId ? a.team.id === teamId : true) // Only filter by team if teamId is provided
            );

            return {
                ...player,
                goals: playerActions.filter(a => a.type === ActionType.GOAL).length,
                shots: playerActions.filter(a => a.type === ActionType.SHOT || a.type === ActionType.GOAL).length,
                turnovers: playerActions.filter(a => a.type === ActionType.TURNOVER).length
            };
        });
    };

    const getDisplayPlayers = () => {
        if (selectedTeamView === 'home') {
            return {
                roster: gameData.teams.home.roster,
                nonRoster: gameData.teams.home.players.filter(p => !gameData.teams.home.roster.some(r => r.id === p.id))
            };

        }
        if (selectedTeamView === 'away') {
            return {
                roster: gameData.teams.away.roster,
                nonRoster: gameData.teams.away.players.filter(p => !gameData.teams.away.roster.some(r => r.id === p.id))
            };
        }
        return {
            roster: [...gameData.teams.home.roster, ...gameData.teams.away.roster],
            nonRoster: [...gameData.teams.home.players, ...gameData.teams.away.players].filter(p => !gameData.teams.home.roster.some(r => r.id === p.id) && !gameData.teams.away.roster.some(r => r.id === p.id))
        };
    };

    const {roster, nonRoster} = getDisplayPlayers();
    const uniqueNonRoster = Array.from(new Map(nonRoster.map(p => [p.id, p])).values());

    const sortedPlayers = getPlayerStats(roster, selectedTeamView === 'all' ? '' :
        selectedTeamView === 'home' ? gameData.teams.home.id : gameData.teams.away.id)
        .sort((a, b) => {
            let compareValue = 0;

            if (sortBy === 'name' || sortBy === 'position') {
                compareValue = a.name.localeCompare(b.name);
            } else {
                const aValue = a[sortBy as keyof typeof a];
                const bValue = b[sortBy as keyof typeof b];

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    compareValue = aValue - bValue;
                }
            }

            return sortOrder === 'asc' ? compareValue : -compareValue;
        });

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const goalies = sortedPlayers.filter(player => player.position === 'Goalie');
    const defenders = sortedPlayers.filter(player => player.position === 'Defender');
    const forwards = sortedPlayers.filter(player => player.position === 'Forward');

    const positionGroups = [
        {title: 'Goalies', players: goalies},
        {title: 'Defenders', players: defenders},
        {title: 'Forwards', players: forwards}
    ];

    const TableHeader = () => (
        <thead>
        <tr>
            {['name', 'jerseyNumber', 'position', 'goals', 'shots', 'turnovers'].map((col) => (
                <th
                    key={col}
                    onClick={() => handleSort(col as keyof IPlayer)}
                >
                    {col === 'jerseyNumber' ? 'Number' :
                        col === 'name' ? 'Name' :
                            col[0].toUpperCase() + col.slice(1)}
                    {sortBy === col && (
                        <span className={styles.sortIndicator}>
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                    )}
                </th>
            ))}
        </tr>
        </thead>
    );

    useEffect(() => {
        updateIconSize();
        const handleResize = () => {
            updateIconSize();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setSelectedPlayer(null);
    }, [selectedTeamView]);

    return (
        <div>
            {/*<GameFilters
                selectedTeamView={selectedTeamView}
                setSelectedTeamView={setSelectedTeamView}
                availablePeriods={availablePeriods}
                selectedPeriods={selectedPeriods}
                togglePeriod={togglePeriod}
                availableActionTypes={availableActionTypes}
                selectedActionTypes={selectedActionTypes}
                toggleActionType={toggleActionType}
                isPeriodFilterDisabled={isTimeFilterActive}
            />*/}

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
                                disabled={isTimeFilterActive}
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

            {/*<GameVisualization
                fieldImageRef={fieldImageRef}
                gameData={gameData}
                filteredActions={filteredActions}
                iconSize={iconSize}
                handleIconClick={(action: IGameAction) => setSelectedActionDetails(action)}
                zoneFilter={zoneFilter}
                setZoneFilter={setZoneFilter}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                minTime={minTime}
                maxTime={maxTime}
            />*/}

            <div className={styles.gameVisualization}>

                <div className={styles.timeFilterContainer}>
                    <div className={styles.timeSliderLabels}>
                        <span>{formatTime(timeFilter[0])}</span>
                        <span>{formatTime(timeFilter[1])}</span>
                    </div>
                    <ReactSlider
                        className={styles.horizontalSlider}
                        thumbClassName={styles.timeSliderThumb}
                        trackClassName={styles.timeSliderTrack}
                        value={timeFilter}
                        onChange={setTimeFilter}
                        min={minTime}
                        max={maxTime}
                        pearling
                        minDistance={1}
                    />
                </div>

                <img
                    ref={fieldImageRef}
                    src={gameData.selectedImage}
                    alt="gamePage"
                    className={styles.gameImage}
                />

                <div className={styles.visualGuides}>
                    <div
                        className={`${styles.visualGuideLine} ${styles.horizontalGuide}`}
                        style={{top: `${zoneFilter.y[0]}%`}}
                    />
                    <div
                        className={`${styles.visualGuideLine} ${styles.horizontalGuide}`}
                        style={{top: `${zoneFilter.y[1]}%`}}
                    />
                    <div
                        className={`${styles.visualGuideLine} ${styles.verticalGuide}`}
                        style={{left: `${zoneFilter.x[0]}%`}}
                    />
                    <div
                        className={`${styles.visualGuideLine} ${styles.verticalGuide}`}
                        style={{left: `${zoneFilter.x[1]}%`}}
                    />
                </div>

                {/* Horizontal (X-axis) Slider */}
                <div className={styles.sliderXContainer}>
                    <ReactSlider
                        className={styles.horizontalSlider}
                        thumbClassName={styles.sliderThumb}
                        trackClassName={styles.sliderTrack}
                        value={zoneFilter.x}
                        onChange={(value: any) => setZoneFilter({...zoneFilter, x: value})}
                        min={0}
                        max={100}
                        pearling
                        minDistance={5}
                    />
                </div>

                {/* Vertical (Y-axis) Slider */}
                <div className={styles.sliderYContainer}>
                    <ReactSlider
                        className={styles.verticalSlider}
                        thumbClassName={styles.sliderThumb}
                        trackClassName={styles.sliderTrack}
                        value={zoneFilter.y}
                        onChange={(value: any) => setZoneFilter({...zoneFilter, y: value})}
                        min={0}
                        max={100}
                        pearling
                        minDistance={5}
                        orientation="vertical"
                    />
                </div>

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
                            size={iconSize}
                            onClick={() => handleIconClick(action)}
                        />
                    </div>
                ))}
            </div>

            {/*<PlayerStats
                selectedPlayer={selectedPlayer}
                setSelectedPlayer={setSelectedPlayer}
                sortBy={sortBy}
                sortOrder={sortOrder}
                handleSort={handleSort}
                sortedPlayers={sortedPlayers}
                uniqueNonRoster={uniqueNonRoster}
            />*/}

            <div className={styles.filterGroup}>
                <h3 className={styles.filterTitle}>Player Statistics</h3>

                {positionGroups.map((group) => (
                    group.players.length > 0 && (
                        <div key={group.title}>
                            <h4 className={styles.filterTitle}>{group.title}</h4>
                            <div className={styles.tableContainer}>
                                <table className={styles.statsTable}>
                                    <TableHeader/>
                                    <tbody>
                                    {group.players.map((player) => (
                                        <tr
                                            key={player.id}
                                            className={`${styles.playerRow} ${selectedPlayer === player.id ? styles.selectedRow : ''}`}
                                            onClick={() => {
                                                if (selectedPlayer === player.id) {
                                                    setSelectedPlayer(null);
                                                } else {
                                                    setSelectedPlayer(player.id);
                                                }
                                            }}
                                        >
                                            <td>{player.name}</td>
                                            <td>{player.jerseyNumber}</td>
                                            <td>{player.position}</td>
                                            <td>{player.goals}</td>
                                            <td>{player.shots}</td>
                                            <td>{player.turnovers}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ))}

                {uniqueNonRoster.length > 0 && (
                    <>
                        <h4 className={styles.nonRosterTitle}>Non-Roster Players</h4>
                        <ul className={styles.nonRosterList}>
                            {uniqueNonRoster.map(player => (
                                <li className={styles.nonRosterItem} key={player.id}>
                                    {player.name} (#{player.jerseyNumber})
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            {selectedActionDetails && (
                <IconDataModal
                    action={selectedActionDetails}
                    onClose={() => setSelectedActionDetails(null)}
                    gameType={gameData.type}
                />
            )}
        </div>
    );
};

export default ActualGameDetails;