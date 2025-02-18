import { Player } from './Player';
import { Position } from '../enums/Position';

describe('Player', () => {
    it('should initialize with default values', () => {
        const player = new Player();
        expect(player.name).toBe('');
        expect(player.position).toBe(Position.GOALIE);
        expect(player.jerseyNumber).toBe(1);
        expect(player.teamId).toBe('');
    });

    it('should initialize with provided values', () => {
        const player = new Player('p1', 'Messi', Position.FORWARD, 10, 't1');
        expect(player.name).toBe('Messi');
        expect(player.position).toBe(Position.FORWARD);
        expect(player.jerseyNumber).toBe(10);
        expect(player.teamId).toBe('t1');
    });

    it('should update properties via setters', () => {
        const player = new Player();
        player.name = 'Ronaldo';
        player.position = Position.FORWARD;
        player.jerseyNumber = 7;
        player.teamId = 't2';

        expect(player.name).toBe('Ronaldo');
        expect(player.position).toBe(Position.FORWARD);
        expect(player.jerseyNumber).toBe(7);
        expect(player.teamId).toBe('t2');
    });

    it('toPlainObject should return correct data', () => {
        const player = new Player('p1', 'Neymar', Position.FORWARD, 11, 't3');
        const plainObj = player.toPlainObject();
        expect(plainObj).toEqual({
            id: 'p1',
            name: 'Neymar',
            position: Position.FORWARD,
            jerseyNumber: 11,
            teamId: 't3'
        });
    });
});