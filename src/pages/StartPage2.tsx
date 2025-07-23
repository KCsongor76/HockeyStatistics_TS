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

    constructor(init?: Partial<GameSetup>) {
        Object.assign(this, init);
    }

    validate() {
        if (!this.championship) return 'Please select a championship';
        if (!this.homeTeam || !this.awayTeam) return 'Please select both teams';
        if (this.homeTeam.id === this.awayTeam.id) return 'Please select different teams';
        if (!this.selectedImage) return 'Please select a rink image';
        return null;
    }
}

const StartPage = () => {

    const navigate = useNavigate();
    const [setup, setSetup] = useState<GameSetup>(new GameSetup());
    const [championships, setChampionships] = useState<Championship[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [rinkImages, setRinkImages] = useState({rinkUp: '', rinkDown: ''});
    const [showRosters, setShowRosters] = useState(false);

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
        if (!setup.championship) return;

        const filtered = allTeams.filter(team =>
            team.championships.some(c => c.id === setup.championship!.id)
        );

        setFilteredTeams(filtered);

        const home = filtered[0] || null;
        const away = filtered[1] || filtered[0] || null;

        setSetup(new GameSetup({
            ...setup,
            homeTeam: home,
            awayTeam: away,
            homeColor: home?.homeColor || {primary: '', secondary: ''},
            awayColor: away?.awayColor || {primary: '', secondary: ''},
            homeRoster: [],
            homeRosterOut: home?.players || [],
            awayRoster: [],
            awayRosterOut: away?.players || []
        }));
    }, [setup.championship, allTeams]);

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
        const error = setup.validate();
        if (error) return alert(error);
        console.log(setup)
        navigate('/game', {state: {setup}});
    };

    const addPlayerToRoster = (player: Player, isHome: boolean) => {
        setSetup(new GameSetup({
            ...setup,
            ...(isHome ? {
                homeRoster: [...setup.homeRoster, player],
                homeRosterOut: setup.homeRosterOut.filter(p => p.id !== player.id)
            } : {
                awayRoster: [...setup.awayRoster, player],
                awayRosterOut: setup.awayRosterOut.filter(p => p.id !== player.id)
            })
        }));
    };

    const removePlayerFromRoster = (player: Player, isHome: boolean) => {
        setSetup(new GameSetup({
            ...setup,
            ...(isHome ? {
                homeRoster: setup.homeRoster.filter(p => p.id !== player.id),
                homeRosterOut: [...setup.homeRosterOut, player]
            } : {
                awayRoster: setup.awayRoster.filter(p => p.id !== player.id),
                awayRosterOut: [...setup.awayRosterOut, player]
            })
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Championship Selection */}
            <div>
                <label>Championship</label>
                <select
                    value={setup.championship?.id || ''}
                    onChange={e => setSetup(new GameSetup({
                        ...setup,
                        championship: championships.find(c => c.id === e.target.value) || null
                    }))}
                >
                    <option value="">Select Championship</option>
                    {championships.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Home Team Selection */}
            <div>
                <label>Home Team</label>
                <select
                    value={setup.homeTeam?.id || ''}
                    onChange={e => handleTeamChange(e.target.value, true)}
                >
                    <option value="">Select Home Team</option>
                    {filteredTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
            </div>

            {/* Away Team Selection */}
            <div>
                <label>Away Team</label>
                <select
                    value={setup.awayTeam?.id || ''}
                    onChange={e => handleTeamChange(e.target.value, false)}
                >
                    <option value="">Select Away Team</option>
                    {filteredTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
            </div>

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
                        {setup.homeTeam?.players.map(player => (
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
                        {setup.awayTeam?.players.map(player => (
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
            {/*todo*/}
            <div>
                <label>Rink Image</label>
                <div
                    onClick={() => setSetup(new GameSetup({
                        ...setup,
                        selectedImage: rinkImages.rinkUp
                    }))}
                >
                    <input
                        type="radio"
                        checked={setup.selectedImage === rinkImages.rinkUp}
                        // onChange={() => setSetup(new GameSetup({
                        //     ...setup,
                        //     selectedImage: rinkImages.rinkUp
                        // }))}
                    />
                    <span>Up</span>
                    <img src={rinkImages.rinkUp} alt={"Up"} />
                </div>

                <div
                    onClick={() => setSetup(new GameSetup({
                        ...setup,
                        selectedImage: rinkImages.rinkDown
                    }))}
                >
                    <input
                        type="radio"
                        checked={setup.selectedImage === rinkImages.rinkDown}
                        // onChange={() => setSetup(new GameSetup({
                        //     ...setup,
                        //     selectedImage: rinkImages.rinkDown
                        // }))}
                    />
                    <span>Down</span>
                    <img src={rinkImages.rinkDown} alt={"Down"} />
                </div>
            </div>

            <button type="submit">Start Game</button>
            <button type="button" onClick={() => navigate('/')}>Go Back</button>
        </form>
    );
};

export default StartPage;