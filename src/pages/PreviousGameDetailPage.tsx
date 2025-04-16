import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {ActionType} from "../OOP/enums/ActionType";
import {RegularPeriod, PlayoffPeriod} from "../OOP/enums/Period";
import GameFilters from "../components/GameFilters";
import GameVisualization from "../components/GameVisualization";
import PlayerStats from "../components/PlayerStats";
// @ts-ignore
import styles from './PreviousGameDetailPage.module.css';
import IconDataModal from "../modals/IconDataModal";
import {GameService} from "../OOP/services/GameService";
import {Game} from "../OOP/classes/Game";
import {GameAction} from "../OOP/classes/GameAction";
import {Player} from "../OOP/classes/Player";



const PreviousGameDetailPage = () => {
    const location = useLocation();
    const gameData = location.state as Game;
    const navigate = useNavigate();

    const fieldImageRef = useRef<HTMLImageElement>(null);
    const [iconSize, setIconSize] = useState(30);

    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    type Period = RegularPeriod | PlayoffPeriod;
    const [selectedPeriods, setSelectedPeriods] = useState<Set<Period>>(new Set(Object.values(RegularPeriod) as Period[]));
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(new Set(Object.values(ActionType)));
    const availablePeriods = Array.from(new Set(gameData.actions.map(action => action.period)));
    const availableActionTypes = Array.from(new Set(gameData.actions.map(action => action.type)));
    const [sortBy, setSortBy] = useState<keyof Player>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    const [timeFilter, setTimeFilter] = useState<[number, number]>([0, 3600]);

    const minTime = 0;
    const maxTime = Math.max(...gameData.actions.map(a => a.time * 60), 3600);

    const [zoneFilter, setZoneFilter] = useState<{ x: [number, number], y: [number, number] }>({
        x: [0, 100],
        y: [0, 100]
    });

    // Determine if zone filter is active
    /*const isZoneFilterActive = zoneFilter.x[0] > 0 ||
        zoneFilter.x[1] < 100 ||
        zoneFilter.y[0] > 0 ||
        zoneFilter.y[1] < 100;*/

    const isTimeFilterActive = timeFilter[0] > minTime || timeFilter[1] < maxTime;

    const filteredActions = gameData.actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action.team.id === gameData.teams.home.id) ||
            (selectedTeamView === 'away' && action.team.id === gameData.teams.away.id);

        // const periodFilter = selectedPeriods.has(action.period);
        const typeFilter = selectedActionTypes.has(action.type);
        const playerFilter = !selectedPlayer || action.player.id === selectedPlayer;
        const zoneXFilter = action.x * 100 >= zoneFilter.x[0] && action.x * 100 <= zoneFilter.x[1];
        const zoneYFilter = action.y * 100 >= zoneFilter.y[0] && action.y * 100 <= zoneFilter.y[1];

        const actionTimeSeconds = 1200 * action.period - action.time;
        const timeFilterPass = actionTimeSeconds >= timeFilter[0] &&
            actionTimeSeconds <= timeFilter[1];
        const periodFilter = isTimeFilterActive ? true : selectedPeriods.has(action.period);

        return teamFilter && periodFilter && typeFilter && playerFilter && zoneXFilter && zoneYFilter && timeFilterPass;
    });

    const [selectedActionDetails, setSelectedActionDetails] = useState<GameAction | null>(null);

    const updateIconSize = () => {
        if (fieldImageRef.current) {
            const imageWidth = fieldImageRef.current.offsetWidth;
            // Calculate icon size as a percentage of image width (3% in this example)
            const newSize = Math.max(Math.floor(imageWidth * 0.03), 20);
            setIconSize(newSize);
        }
    };

    const handleSort = (column: keyof Player) => {
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

    const handleIconClick = (action: GameAction) => {
        setSelectedActionDetails(action);
    };

    const handleCloseIconData = () => {
        setSelectedActionDetails(null);
    };

    const getPlayerStats = (players: Player[], teamId: string) => {
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

    const deleteHandler = async (game: Game) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this game?");
        if (isConfirmed) {
            try {
                await GameService.deleteGame(game);
                navigate(-1);
            } catch (error) {
                console.error("Error deleting action:", error);
            }
        }
    }

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
        setSelectedPlayer(null); // Clear player selection when team view changes
    }, [selectedTeamView]); // Trigger when selectedTeamView changes

    return (
        <div className={styles.container}>
            {selectedActionDetails && (
                <IconDataModal
                    action={selectedActionDetails}
                    onClose={handleCloseIconData}
                />
            )}

            <GameFilters
                selectedTeamView={selectedTeamView}
                setSelectedTeamView={setSelectedTeamView}
                availablePeriods={availablePeriods}
                selectedPeriods={selectedPeriods}
                togglePeriod={togglePeriod}
                availableActionTypes={availableActionTypes}
                selectedActionTypes={selectedActionTypes}
                toggleActionType={toggleActionType}
                isPeriodFilterDisabled={isTimeFilterActive}
            />

            <GameVisualization
                fieldImageRef={fieldImageRef}
                gameData={gameData}
                filteredActions={filteredActions}
                iconSize={iconSize}
                handleIconClick={handleIconClick}
                zoneFilter={zoneFilter}
                setZoneFilter={setZoneFilter}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                minTime={minTime}
                maxTime={maxTime}
            />

            <div className={styles.container}>
                <PlayerStats
                    selectedPlayer={selectedPlayer}
                    setSelectedPlayer={setSelectedPlayer}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    handleSort={handleSort}
                    sortedPlayers={sortedPlayers}
                    uniqueNonRoster={uniqueNonRoster}
                />
            </div>

            <button
                className={styles.deleteButton}
                onClick={async () => {
                    await deleteHandler(gameData)
                }}
            >
                Delete Game
            </button>

            <button
                className={styles.button}
                onClick={() => {
                    navigate(-1)
                }}
            >
                Go Back
            </button>
        </div>
    );
};

export default PreviousGameDetailPage;