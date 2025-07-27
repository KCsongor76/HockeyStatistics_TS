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

// todo: check filter logic

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

            {/* Season Selection */}
            <div>
                <label>Season</label>
                <select
                    value={setup.season}
                    onChange={e => setSetup(new GameSetup({
                        ...setup,
                        season: e.target.value as Season || ""
                        // championship: null
                    }))}
                >
                    <option value="">Select Season</option>
                    {seasons.map(season => (
                        <option key={season} value={season}>{season}</option>
                    ))}
                </select>
                {errors.season && <span>{errors.season}</span>}
            </div>

            {/* Championship Selection (now filtered by season) */}
            <div>
                <label>Championship</label>
                <select
                    value={setup.championship?.id || ''}
                    onChange={e => setSetup(prev => new GameSetup({
                        ...prev, // Keep existing season
                        championship: championships.find(c => c.id === e.target.value) || null
                    }))}
                >
                    <option value="">Select Championship</option>
                    {championships.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                {errors.championship && <span>{errors.championship}</span>}
            </div>

            {/* Home Team Selection */}
            <div>
                <label>Home Team</label>
                <select
                    value={setup.homeTeam?.id || ''}
                    onChange={e => handleTeamChange(e.target.value, true)}
                >
                    {!setup.championship && <option value="">Select Home Team</option>}
                    {filteredTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
                {errors.homeTeam && <span>{errors.homeTeam}</span>}
            </div>

            {/* Away Team Selection */}
            <div>
                <label>Away Team</label>
                <select
                    value={setup.awayTeam?.id || ''}
                    onChange={e => handleTeamChange(e.target.value, false)}
                >
                    { !setup.championship && <option value="">Select Away Team</option>}
                    {filteredTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
                {errors.awayTeam && <span>{errors.awayTeam}</span>}
            </div>

            {errors.teams && <span>{errors.teams}</span>}

            {/* Game Type Selection */}
            <div>
                <label>Game Type</label>
                <select
                    value={setup.gameType}
                    onChange={e => setSetup(new GameSetup({
                        ...setup,
                        gameType: e.target.value as GameType
                    }))}
                >
                    {Object.values(GameType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Team Colors */}
            <div>
                <label>Home Colors</label>
                <input
                    type="color"
                    value={setup.homeColor.primary}
                    onChange={e => setSetup(new GameSetup({
                        ...setup,
                        homeColor: {...setup.homeColor, primary: e.target.value}
                    }))}
                />
                <input
                    type="color"
                    value={setup.homeColor.secondary}
                    onChange={e => setSetup(new GameSetup({
                        ...setup,
                        homeColor: {...setup.homeColor, secondary: e.target.value}
                    }))}
                />
            </div>

            <div>
                <label>Away Colors</label>
                <input
                    type="color"
                    value={setup.awayColor.primary}
                    onChange={e => setSetup(new GameSetup({
                        ...setup,
                        awayColor: {...setup.awayColor, primary: e.target.value}
                    }))}
                />
                <input
                    type="color"
                    value={setup.awayColor.secondary}
                    onChange={e => setSetup(new GameSetup({
                        ...setup,
                        awayColor: {...setup.awayColor, secondary: e.target.value}
                    }))}
                />
            </div>

            {/* Roster Management */}
            <button type="button" onClick={() => setShowRosters(!showRosters)}>
                {showRosters ? 'Hide Rosters' : 'Show Rosters'}
            </button>

            {showRosters && (
                <>
                    {/* Home Roster Selection */}
                    <div>
                        <h3>Home Roster</h3>
                        <h4>Available Players</h4>
                        {setup.homeRosterOut.map(player => (
                            <div key={player.id}>
                                <span>{player.name}</span>
                                <button
                                    type="button"
                                    onClick={() => addPlayerToRoster(player, true)}
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                        <h4>Selected Players</h4>
                        {setup.homeRoster.map(player => (
                            <div key={player.id}>
                                <span>{player.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removePlayerFromRoster(player, true)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Away Roster Selection */}
                    <div>
                        <h3>Away Roster</h3>
                        <h4>Available Players</h4>
                        {setup.awayRosterOut.map(player => (
                            <div key={player.id}>
                                <span>{player.name}</span>
                                <button
                                    type="button"
                                    onClick={() => addPlayerToRoster(player, false)}
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                        <h4>Selected Players</h4>
                        {setup.awayRoster.map(player => (
                            <div key={player.id}>
                                <span>{player.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removePlayerFromRoster(player, false)}
                                >
                                    Remove
                                </button>
                            </div>
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

            <button type="submit">Start Game</button>
            <button type="button" onClick={() => navigate('/')}>Go Back</button>
        </form>
    );
};

export default StartPage;