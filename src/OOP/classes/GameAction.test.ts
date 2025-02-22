import {GameAction} from './GameAction';
import {Team} from './Team';
import {Player} from './Player';
import {GameType} from '../enums/GameType';
import {RegularPeriod, PlayoffPeriod} from '../enums/Period';
import {ActionType} from "../enums/ActionType";

describe('GameAction', () => {
    const team = new Team('t1', 'Team A');
    const player = new Player('p1', 'Player 1');
    const period = RegularPeriod.FIRST;
    const type = ActionType.SHOT;

    it('should initialize all properties correctly', () => {
        const action = new GameAction(team, period, 15.3, type, player, 50, 75);

        // Access private properties to verify initialization
        expect((action as any)._team).toBe(team);
        expect((action as any)._period).toBe(period);
        expect((action as any)._time).toBe(15.3);
        expect((action as any)._type).toBe(type);
        expect((action as any)._player).toBe(player);
        expect((action as any)._x).toBe(50);
        expect((action as any)._y).toBe(75);
    });
});