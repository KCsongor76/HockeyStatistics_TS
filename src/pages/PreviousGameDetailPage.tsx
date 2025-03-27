import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {ActionType} from "../OOP/enums/ActionType";
import {RegularPeriod, PlayoffPeriod} from "../OOP/enums/Period";
import GameFilters from "../components/GameFilters";
import GameVisualization from "../components/GameVisualization";
import PlayerStats from "../components/PlayerStats";
// @ts-ignore
import styles from './PreviousGameDetailPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";
import {IGameAction} from "../OOP/interfaces/IGameAction";
import IconDataModal from "../modals/IconDataModal";
import {GameService} from "../OOP/services/GameService";
import {IPlayer} from "../OOP/interfaces/IPlayer";

// todo: navigation fix
// todo: player table styling under 768 px - maybe scrap, unify
// todo: clear player filter - no button, but same click
// todo: name, position sorting is not the best

// todo: into filtering: add zone filter (the picture is a rectangle,
//  so add on the bottom side and left side 1-1 lines, with 2-2 sliders each,
//  and these sliders determine that which positioned gameAction Icons should be shown)

// todo: add time filtering: line with 2 slider points, and for eg, we can set the first slider to 5 min,
//  the next to 10 min, so we only see the actions within that time range. if this is active,
//  then the period filters should be inactive.


const PreviousGameDetailPage = () => {
    const location = useLocation();
    const gameData = location.state as IGame;
    const navigate = useNavigate();

    const fieldImageRef = useRef<HTMLImageElement>(null);
    const [iconSize, setIconSize] = useState(30);

    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    type Period = RegularPeriod | PlayoffPeriod;
    const [selectedPeriods, setSelectedPeriods] = useState<Set<Period>>(new Set(Object.values(RegularPeriod) as Period[]));
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(new Set(Object.values(ActionType)));
    const availablePeriods = Array.from(new Set(gameData.actions.map(action => action.period)));
    const availableActionTypes = Array.from(new Set(gameData.actions.map(action => action.type)));
    const [sortBy, setSortBy] = useState<keyof IPlayer>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    const filteredActions = gameData.actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action.team.id === gameData.teams.home.id) ||
            (selectedTeamView === 'away' && action.team.id === gameData.teams.away.id);

        const periodFilter = selectedPeriods.has(action.period);
        const typeFilter = selectedActionTypes.has(action.type);

        const playerFilter = !selectedPlayer || action.player.id === selectedPlayer;
        return teamFilter && periodFilter && typeFilter && playerFilter;
    });


    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);

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

    const deleteHandler = async (game: IGame) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this game?");
        if (isConfirmed) {
            try {
                await GameService.deleteGame(game);
                navigate('/previous_games');
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
            />

            <GameVisualization
                fieldImageRef={fieldImageRef}
                gameData={gameData}
                filteredActions={filteredActions}
                iconSize={iconSize}
                handleIconClick={handleIconClick}
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
                    navigate("/previous_games")
                }}
            >
                Go Back
            </button>
        </div>
    );
};

export default PreviousGameDetailPage;