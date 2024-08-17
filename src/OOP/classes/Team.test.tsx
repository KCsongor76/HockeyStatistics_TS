import { Team } from './Team';
import { Player } from './Player';
import { Championship } from './Championship';
import { TeamColor } from '../interfaces/TeamColor';

describe('Team', () => {
    let team: Team;
    let mockPlayers: Player[];
    let mockChampionships: Championship[];
    let mockHomeColor: TeamColor;
    let mockAwayColor: TeamColor;

    beforeEach(() => {
        mockPlayers = [new Player(), new Player()];
        mockChampionships = [new Championship(), new Championship()];
        mockHomeColor = { primary: "blue", secondary: "white" };
        mockAwayColor = { primary: "red", secondary: "black" };

        team = new Team(
            "1",
            "Test Team",
            "test-logo.png",
            mockHomeColor,
            mockAwayColor,
            mockChampionships,
            mockPlayers
        );
    });

    it('should create a team instance with correct properties', () => {
        expect(team.id).toBe("1");
        expect(team.name).toBe("Test Team");
        expect(team.logo).toBe("test-logo.png");
        expect(team.homeColor).toEqual(mockHomeColor);
        expect(team.awayColor).toEqual(mockAwayColor);
        expect(team.championships).toEqual(mockChampionships);
        expect(team.players).toEqual(mockPlayers);
    });

    it('should allow setting and getting name', () => {
        team.name = "New Name";
        expect(team.name).toBe("New Name");
    });

    it('should allow setting and getting logo', () => {
        team.logo = "new-logo.png";
        expect(team.logo).toBe("new-logo.png");
    });

    it('should allow setting and getting home color', () => {
        const newHomeColor = { primary: "green", secondary: "yellow" };
        team.homeColor = newHomeColor;
        expect(team.homeColor).toEqual(newHomeColor);
    });

    it('should allow setting and getting away color', () => {
        const newAwayColor = { primary: "purple", secondary: "orange" };
        team.awayColor = newAwayColor;
        expect(team.awayColor).toEqual(newAwayColor);
    });

    it('should allow setting and getting championships', () => {
        const newChampionships = [new Championship()];
        team.championships = newChampionships;
        expect(team.championships).toEqual(newChampionships);
    });

    it('should allow setting and getting players', () => {
        const newPlayers = [new Player()];
        team.players = newPlayers;
        expect(team.players).toEqual(newPlayers);
    });

    it('should convert to plain object correctly', () => {
        const plainObject = team.toPlainObject();
        expect(plainObject).toEqual({
            name: "Test Team",
            logo: "test-logo.png",
            homeColor: mockHomeColor,
            awayColor: mockAwayColor,
            championships: mockChampionships,
        });
    });
});
