import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Championship} from "../OOP/classes/Championship";
import {Team} from "../OOP/classes/Team";
import {GameType} from "../OOP/enums/GameType";
import {ITeamColor} from "../OOP/interfaces/ITeamColor";
import {Player} from "../OOP/classes/Player";
import {ChampionshipService} from "../OOP/services/ChampionshipService";
import {TeamService} from "../OOP/services/TeamService";
import {getDownloadURL, ref} from "firebase/storage";
import {storage} from "../firebaseConfig";
import ContinueOrStartOverModal from "../modals/ContinueOrStartOverModal";
import {Season} from "../OOP/enums/Season";
import {Select} from "../components/CRUD/Select";
import {ColorPicker} from "../components/ColorPicker";
import RosterManager from "../components/RosterManager";
import {CustomButton} from "../components/CustomButton";

class GameSetup {
    championship: Championship | null = null;
    homeTeam: Team | null = null;
    awayTeam: Team | null = null;
    gameType: GameType = GameType.REGULAR;
    homeColor: ITeamColor = {primary: '#000000', secondary: '#FFFFFF'};
    awayColor: ITeamColor = {primary: '#FFFFFF', secondary: '#000000'};
    homeRoster: Player[] = [];
    homeRosterOut: Player[] = [];
    awayRoster: Player[] = [];
    awayRosterOut: Player[] = [];
    selectedImage = '';
    season: Season | string = "";

    constructor(init?: Partial<GameSetup>) {
        Object.assign(this, init);
    }

    validate() {
        const errors: Record<string, string> = {};
        if (!this.championship) errors.championship = 'Please select a championship';
        if (!this.homeTeam) errors.homeTeam = 'Please select home team';
        if (!this.awayTeam) errors.awayTeam = 'Please select away team';
        if (this.homeTeam?.id === this.awayTeam?.id) errors.teams = 'Please select different teams';
        if (!this.selectedImage) errors.image = 'Please select a rink image';
        if (!this.season) errors.season = 'Please select a season';
        return errors;
    }
}

const StartPage = () => {

    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    const [setup, setSetup] = useState<GameSetup>(new GameSetup());
    const [championships, setChampionships] = useState<Championship[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [rinkImages, setRinkImages] = useState({rinkUp: '', rinkDown: ''});
    const [showRosters, setShowRosters] = useState(false);
    const [showContinueModal, setShowContinueModal] = useState(false);
    const [savedGameState, setSavedGameState] = useState<any>(null);
    const seasons = Object.values(Season);

    useEffect(() => {
        const loadData = async () => {
            try {
                const championshipsData = await ChampionshipService.getAllChampionships();
                const teamsData = await TeamService.getAllTeams();
                setChampionships(championshipsData.map(c => new Championship(c.id, c.name)));

                setAllTeams(teamsData.map(t => Team.fromPlain(t)));
                const [rinkDown, rinkUp] = await Promise.all([
                    getDownloadURL(ref(storage, "rink-images/icerink_down.jpg")),
                    getDownloadURL(ref(storage, "rink-images/icerink_up.jpg")),
                ]);
                setRinkImages({rinkUp: rinkUp, rinkDown: rinkDown});
            } catch (error) {
                console.error('Error loading data', error);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const filtered = setup.championship
            ? allTeams.filter(team =>
                team.championships.some(c => c.id === setup.championship!.id)
            )
            : [] /*allTeams*/;

        setFilteredTeams(filtered);

        // Only reset teams if they're not in the new filtered list (compare by ID)
        const home = setup.homeTeam && filtered.some(t => t.id === setup.homeTeam!.id)
            ? setup.homeTeam
            : filtered[0] || null;

        const away = setup.awayTeam && filtered.some(t => t.id === setup.awayTeam!.id)
            ? setup.awayTeam
            : filtered[1] || filtered[0] || null;

        setSetup(prev => new GameSetup({
            ...prev,
            homeTeam: home,
            awayTeam: away,
            homeColor: home?.homeColor || prev.homeColor,
            awayColor: away?.awayColor || prev.awayColor,
            homeRoster: [],
            homeRosterOut: home?.players || [],
            awayRoster: [],
            awayRosterOut: away?.players || []
        }));

    }, [setup.championship, allTeams]);

    // Check for saved game
    useEffect(() => {
        const savedGame = localStorage.getItem('unfinishedGame');
        if (savedGame) {
            setSavedGameState(JSON.parse(savedGame));
            setShowContinueModal(true);
        }
    }, []);

    const handleContinue = () => {
        navigate('/game', {
            state: {
                setup: savedGameState.formData,
                savedGameState: savedGameState
            }
        });
        setShowContinueModal(false);
    };

    // Handle Start Over button
    const handleStartOver = () => {
        localStorage.removeItem('unfinishedGame');
        setShowContinueModal(false);
    };

    const handleTeamChange = (teamId: string, isHome: boolean) => {
        const team = filteredTeams.find(t => t.id === teamId) || null;

        setSetup(new GameSetup({
            ...setup,
            ...(isHome ? {
                homeTeam: team,
                homeColor: team?.homeColor || setup.homeColor,
                homeRoster: [],
                homeRosterOut: team?.players || []
            } : {
                awayTeam: team,
                awayColor: team?.awayColor || setup.awayColor,
                awayRoster: [],
                awayRosterOut: team?.players || []
            })
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formErrors = setup.validate();
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) return;

        navigate('/game', {state: {setup}});
    };

    const addPlayerToRoster = (player: Player, isHome: boolean) => {
        const rosterKey = isHome ? 'homeRoster' : 'awayRoster';
        const rosterOutKey = isHome ? 'homeRosterOut' : 'awayRosterOut';

        // Check if player is already in roster
        if (setup[rosterKey].some(p => p.id === player.id)) return;

        setSetup(new GameSetup({
            ...setup,
            [rosterKey]: [...setup[rosterKey], player],
            [rosterOutKey]: setup[rosterOutKey].filter(p => p.id !== player.id)
        }));
    };

    // Update the removePlayerFromRoster function
    const removePlayerFromRoster = (player: Player, isHome: boolean) => {
        const rosterKey = isHome ? 'homeRoster' : 'awayRoster';
        const rosterOutKey = isHome ? 'homeRosterOut' : 'awayRosterOut';

        setSetup(new GameSetup({
            ...setup,
            [rosterKey]: setup[rosterKey].filter(p => p.id !== player.id),
            [rosterOutKey]: [...setup[rosterOutKey], player]
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
            {showContinueModal && (
                <ContinueOrStartOverModal
                    onContinue={handleContinue}
                    onStartOver={handleStartOver}
                />
            )}

            <Select
                label={"Season"}
                value={setup.season}
                options={seasons.map(season => ({value: season, label: season}))}
                onChange={(value) => setSetup(new GameSetup({
                    ...setup,
                    season: value as Season || ""
                }))}
                includeAll={true}
                allLabel={"Select Season"}
                id={"season-select"}
            />
            {errors.season && <span>{errors.season}</span>}

            <Select
                label={"Championship"}
                value={setup.championship?.id || ""}
                options={championships.map(c => ({value: c.id, label: c.name}))}
                onChange={(value) => setSetup(new GameSetup({
                    ...setup,
                    championship: championships.find(c => c.id === value) // || null
                }))}
                includeAll={true}
                allLabel={"Select Championship"}
                id={"championship-select"}
            />
            {errors.championship && <span>{errors.championship}</span>}

            <Select
                label={"Home Team"}
                value={setup.homeTeam?.id || ''}
                options={filteredTeams.map(team => ({value: team.id, label: team.name}))}
                onChange={value => handleTeamChange(value, true)}
                includeAll={!setup.championship}
                allLabel={"Select Home Team"}
                id={"home-team-select"}
            />
            {errors.homeTeam && <span>{errors.homeTeam}</span>}

            <Select
                label={"Away Team"}
                value={setup.awayTeam?.id || ''}
                options={filteredTeams.map(team => ({value: team.id, label: team.name}))}
                onChange={value => handleTeamChange(value, false)}
                includeAll={!setup.championship}
                allLabel={"Select Away Team"}
                id={"away-team-select"}
            />
            {errors.awayTeam && <span>{errors.awayTeam}</span>}
            {errors.teams && <span>{errors.teams}</span>}

            <Select
                label={"Game Type"}
                value={setup.gameType}
                options={Object.values(GameType).map(gameType => ({value: gameType, label: gameType}))}
                onChange={value => setSetup(new GameSetup({
                    ...setup,
                    gameType: value as GameType
                }))}
            />

            {/* Team Colors */}
            <ColorPicker
                label={"Home Colors"}
                primaryColor={setup.homeColor.primary}
                secondaryColor={setup.homeColor.secondary}
                onPrimaryChange={value => setSetup(new GameSetup({
                    ...setup,
                    homeColor: {...setup.homeColor, primary: value}
                }))}
                onSecondaryChange={value => setSetup(new GameSetup({
                    ...setup,
                    homeColor: {...setup.homeColor, secondary: value}
                }))}
            />

            <ColorPicker
                label={"Away Colors"}
                primaryColor={setup.awayColor.primary}
                secondaryColor={setup.awayColor.secondary}
                onPrimaryChange={value => setSetup(new GameSetup({
                    ...setup,
                    awayColor: {...setup.awayColor, primary: value}
                }))}
                onSecondaryChange={value => setSetup(new GameSetup({
                    ...setup,
                    awayColor: {...setup.awayColor, secondary: value}
                }))}
            />

            {/* Roster Management */}
            <CustomButton type="neutral" onClick={() => setShowRosters(!showRosters)}>
                {showRosters ? 'Hide Rosters' : 'Show Rosters'}
            </CustomButton>

            {showRosters && (
                <>
                    {/* Home Roster Selection */}
                    <div>
                        <h3>Home Roster</h3>
                        <h4>Available Players</h4>
                        {setup.homeRosterOut.map(player => (
                            <RosterManager
                                key={player.id}
                                player={player}
                                isHome={true}
                                rosterHandler={addPlayerToRoster}
                            />
                        ))}
                        <h4>Selected Players</h4>
                        {setup.homeRoster.map(player => (
                            <RosterManager
                                key={player.id}
                                player={player}
                                isHome={true}
                                rosterHandler={removePlayerFromRoster}
                            />
                        ))}
                    </div>

                    {/* Away Roster Selection */}
                    <div>
                        <h3>Away Roster</h3>
                        <h4>Available Players</h4>
                        {setup.awayRosterOut.map(player => (
                            <RosterManager
                                key={player.id}
                                player={player}
                                isHome={false}
                                rosterHandler={addPlayerToRoster}
                            />
                        ))}
                        <h4>Selected Players</h4>
                        {setup.awayRoster.map(player => (
                            <RosterManager
                                key={player.id}
                                player={player}
                                isHome={false}
                                rosterHandler={removePlayerFromRoster}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Rink Image Selection */}
            <div>
                <label>Rink Image</label>
                <div>
                    <label>
                        <input
                            type="radio"
                            checked={setup.selectedImage === rinkImages.rinkUp}
                            onChange={() => setSetup(new GameSetup({
                                ...setup,
                                selectedImage: rinkImages.rinkUp
                            }))}
                        />
                        <span>Up</span>
                        <img src={rinkImages.rinkUp} alt="Up" style={{maxWidth: '100px'}}/>
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="radio"
                            checked={setup.selectedImage === rinkImages.rinkDown}
                            onChange={() => setSetup(new GameSetup({
                                ...setup,
                                selectedImage: rinkImages.rinkDown
                            }))}
                        />
                        <span>Down</span>
                        <img src={rinkImages.rinkDown} alt="Down" style={{maxWidth: '100px'}}/>
                    </label>
                </div>
                {errors.image && <span>{errors.image}</span>}
            </div>

            <CustomButton type="positive" buttonType="submit">
                Start Game
            </CustomButton>
            <CustomButton type="negative" onClick={() => navigate('/')}>
                Go Back
            </CustomButton>
        </form>
    );
};

export default StartPage;