import { Championship } from './Championship';

describe('Championship', () => {
    it('should initialize with default values', () => {
        const championship = new Championship();
        expect(championship.name).toBe('');
        expect(championship.id).toBe('');
    });

    it('should initialize with provided values', () => {
        const championship = new Championship('Premier League', 'CH123');
        expect(championship.name).toBe('Premier League');
        expect(championship.id).toBe('CH123');
    });

    it('should update name via setter', () => {
        const championship = new Championship();
        championship.name = 'La Liga';
        expect(championship.name).toBe('La Liga');
    });

    it('should have readonly id', () => {
        const championship = new Championship('', 'CH456');
        expect(championship.id).toBe('CH456');
    });
});