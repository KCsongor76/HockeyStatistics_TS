import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {ActionType} from "../OOP/enums/ActionType";
import {PlayoffPeriod, RegularPeriod} from "../OOP/enums/Period";
// @ts-ignore
import styles from './PreviousGameDetailPage.module.css';
import {IGame} from "../OOP/interfaces/IGame";
import {IGameAction} from "../OOP/interfaces/IGameAction";
import IconDataModal from "../modals/IconDataModal";
import {GameService} from "../OOP/services/GameService";
import {IPlayer} from "../OOP/interfaces/IPlayer";
import {GameType} from "../OOP/enums/GameType";
import {CustomButton} from "../components/CustomButton";
import GameStatsStatic from "../components/GameStatsStatic";
import GameFilters from "../components/GameFilters";
import PlayerStatsSection from "../components/PlayerStatsSection";
import RinkWithIcons from "../components/RinkWithIcons";
import {Player} from "../OOP/classes/Player";

const PreviousGameDetailPage = () => {
    const location = useLocation();
    const gameData = location.state as IGame;
    const navigate = useNavigate();
    const isPlayoff = gameData.type === GameType.PLAYOFF;

    const fieldImageRef = useRef<HTMLImageElement>(null);
    const [iconSize, setIconSize] = useState(30);

    const [selectedTeamView, setSelectedTeamView] = useState<'all' | 'home' | 'away'>('all');
    type Period = RegularPeriod | PlayoffPeriod;
    const [selectedPeriods, setSelectedPeriods] = useState<Set<Period>>(new Set(Object.values(RegularPeriod) as Period[]));
    const [selectedActionTypes, setSelectedActionTypes] = useState<Set<ActionType>>(new Set(Object.values(ActionType)));
    const [sortBy, setSortBy] = useState<keyof IPlayer>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

    const calculateActionTimeSeconds = (action: IGameAction): number => {
        const period = action.period;
        let periodStart = 0;
        let periodDuration = 0;

        if (isPlayoff) {
            if (period <= 3) {
                periodDuration = 1200;
                periodStart = (period - 1) * 1200;
            } else {
                periodDuration = 1200;
                const otNumber = period - 3;
                periodStart = 3600 + (otNumber - 1) * 1200;
            }
        } else {
            if (period <= 3) {
                periodDuration = 1200;
                periodStart = (period - 1) * 1200;
            } else if (period === 4) { // OT
                periodDuration = 300;
                periodStart = 3600;
            } else if (period === 5) { // SO
                periodDuration = 0;
                periodStart = 3600 + 300; // 3900
            }
        }

        const elapsedInPeriod = periodDuration - action.time;
        return periodStart + elapsedInPeriod;
    };

    const initialActionTimes = gameData.actions.map(a => calculateActionTimeSeconds(a));
    const defaultMaxTime = isPlayoff ? 4800 : 3900; // OT1 for playoff, OT for regular
    const initialMaxTime = initialActionTimes.length > 0 ? Math.max(...initialActionTimes) : defaultMaxTime;
    const [timeFilter, setTimeFilter] = useState<[number, number]>([0, initialMaxTime]);
    const minTime = 0;
    // const maxTime = initialMaxTime;
    const [maxTime, setMaxTime] = useState(defaultMaxTime);

    const isTimeFilterActive = timeFilter[0] > minTime || timeFilter[1] < maxTime;

    const filteredActions = gameData.actions.filter(action => {
        const teamFilter = selectedTeamView === 'all' ||
            (selectedTeamView === 'home' && action.team.id === gameData.teams.home.id) ||
            (selectedTeamView === 'away' && action.team.id === gameData.teams.away.id);

        // const periodFilter = selectedPeriods.has(action.period);
        const typeFilter = selectedActionTypes.has(action.type);
        const playerFilter = !selectedPlayer || action.player.id === selectedPlayer;

        const actionTimeSeconds = calculateActionTimeSeconds(action);
        const timeFilterPass = actionTimeSeconds >= timeFilter[0] &&
            actionTimeSeconds <= timeFilter[1];
        const periodFilter = isTimeFilterActive ? true : selectedPeriods.has(action.period);

        return teamFilter && periodFilter && typeFilter && playerFilter && timeFilterPass;
    });

    const [selectedActionDetails, setSelectedActionDetails] = useState<IGameAction | null>(null);


    const updateIconSize = () => {
        if (fieldImageRef.current) {
            const imageWidth = fieldImageRef.current.offsetWidth;
            // Calculate icon size as a percentage of image width (3% in this example)
            const newSize = Math.max(Math.floor(imageWidth * 0.01), 20);
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

    const handleIconClick = (action: IGameAction) => {
        setSelectedActionDetails(action);
    };

    const handleCloseIconData = () => {
        setSelectedActionDetails(null);
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
                navigate(-1);
            } catch (error) {
                console.error("Error deleting action:", error);
            }
        }
    }

    const homeStats = {
        goals: filteredActions.filter(a =>
            a.team.id === gameData.teams.home.id &&
            a.type === ActionType.GOAL
        ).length,
        shots: filteredActions.filter(a =>
            a.team.id === gameData.teams.home.id &&
            (a.type === ActionType.SHOT || a.type === ActionType.GOAL)
        ).length,
        turnovers: filteredActions.filter(a =>
            a.team.id === gameData.teams.home.id &&
            a.type === ActionType.TURNOVER
        ).length
    };

    const awayStats = {
        goals: filteredActions.filter(a =>
            a.team.id === gameData.teams.away.id &&
            a.type === ActionType.GOAL
        ).length,
        shots: filteredActions.filter(a =>
            a.team.id === gameData.teams.away.id &&
            (a.type === ActionType.SHOT || a.type === ActionType.GOAL)
        ).length,
        turnovers: filteredActions.filter(a =>
            a.team.id === gameData.teams.away.id &&
            a.type === ActionType.TURNOVER
        ).length
    };

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

    useEffect(() => {
        const actionTimes = gameData.actions.map(a => calculateActionTimeSeconds(a));
        const newMaxTime = actionTimes.length > 0 ? Math.max(...actionTimes) : defaultMaxTime;
        setMaxTime(newMaxTime);
        setTimeFilter(prev => [prev[0], newMaxTime]);
    }, [gameData.actions, defaultMaxTime]);

    const playerStats = Player.getPlayerStats(
        roster,
        gameData.actions,
        selectedTeamView === 'all' ? '' : selectedTeamView === 'home' ? gameData.teams.home.id : gameData.teams.away.id
    ).map(player => {
        const assists = gameData.actions.filter(a =>
            a.assists?.some(assist => assist.id === player.id)
        ).length;
        return {
            ...player,
            assists,
            points: player.goals + assists
        };
    });

    return (
        <div className={styles.container}>
            <h1>Full game stats</h1>
            <div className={styles.statsSection}>
                <GameStatsStatic
                    homeTeam={gameData.teams.home}
                    awayTeam={gameData.teams.away}
                    homeStats={gameData.score.home}
                    awayStats={gameData.score.away}
                />
            </div>

            <h1>Active filtered stats</h1>
            <div className={styles.statsSection}>
                <GameStatsStatic
                    homeTeam={gameData.teams.home}
                    awayTeam={gameData.teams.away}
                    homeStats={homeStats}
                    awayStats={awayStats}
                />
            </div>

            <div className={styles.filtersSection}>
                <GameFilters
                    gameData={gameData}
                    isTimeFilterActive={isTimeFilterActive}
                    onTeamViewChange={setSelectedTeamView}
                    onPeriodsChange={setSelectedPeriods}
                    onActionTypesChange={setSelectedActionTypes}
                    initialTeamView={selectedTeamView}
                    initialPeriods={selectedPeriods}
                    initialActionTypes={selectedActionTypes}
                />
            </div>

            <div className={styles.rinkContainer}>
                <RinkWithIcons
                    imageRef={fieldImageRef}
                    src={gameData.selectedImage}
                    filteredActions={filteredActions}
                    handleIconClick={handleIconClick}
                    iconSize={iconSize}
                />
            </div>

            <div className={styles.playerStatsSection}>
                <PlayerStatsSection
                    positionGroups={[]}
                    handleSort={handleSort}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    selectedPlayer={selectedPlayer}
                    setSelectedPlayer={setSelectedPlayer}
                    uniqueNonRoster={uniqueNonRoster}
                    playerStats={playerStats}
                />
            </div>

            <div className={styles.buttonGroup}>
                <CustomButton type="negative" onClick={() => deleteHandler(gameData)}>
                    Delete Game
                </CustomButton>
                <CustomButton type="neutral" onClick={() => navigate(-1)}>
                    Go Back
                </CustomButton>
            </div>

            {selectedActionDetails && (
                <IconDataModal
                    action={selectedActionDetails}
                    onClose={handleCloseIconData}
                    gameType={gameData.type}
                />
            )}
        </div>
    );
};

export default PreviousGameDetailPage;