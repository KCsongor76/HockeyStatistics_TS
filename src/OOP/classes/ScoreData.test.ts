import { ScoreData } from './ScoreData';

describe('ScoreData', () => {
    it('should initialize with provided values', () => {
        const score = new ScoreData(3, 10, 5);
        expect((score as any)._goals).toBe(3);
        expect((score as any)._shots).toBe(10);
        expect((score as any)._turnovers).toBe(5);
    });
});