import { checkBingoLines, generateRandomCardLayout, generateSessionCode } from '../lib/bingo';

describe('Bingo Utilities', () => {
    describe('checkBingoLines', () => {
        // Standard 5x4 grid
        const mockLayout = [
            '1', '2', '3', '4', '5',    // Row 0
            '6', '7', '8', '9', '10',   // Row 1
            '11', '12', '13', '14', '15', // Row 2
            '16', '17', '18', '19', '20'  // Row 3
        ];

        it('identifies horizontal bingo lines', () => {
            // Row 0 complete
            const completed = ['1', '2', '3', '4', '5'];
            expect(checkBingoLines(mockLayout, completed)).toBe(1);
        });

        it('identifies vertical bingo lines', () => {
            // Col 0 complete (1, 6, 11, 16)
            const completed = ['1', '6', '11', '16'];
            expect(checkBingoLines(mockLayout, completed)).toBe(1);
        });

        it('identifies diagonal bingo lines (top-left to bottom-right)', () => {
            // 0,0 (1) -> 1,1 (7) -> 2,2 (13) -> 3,3 (19)
            const completed = ['1', '7', '13', '19'];
            expect(checkBingoLines(mockLayout, completed)).toBe(1);
        });

        it('identifies diagonal bingo lines (top-right to bottom-left)', () => {
            // 0,4 (5) -> 1,3 (9) -> 2,2 (13) -> 3,1 (17)
            const completed = ['5', '9', '13', '17'];
            expect(checkBingoLines(mockLayout, completed)).toBe(1);
        });

        it('counts multiple lines', () => {
            // Row 0 and Col 0
            const completed = ['1', '2', '3', '4', '5', '6', '11', '16'];
            expect(checkBingoLines(mockLayout, completed)).toBe(2);
        });

        it('returns 0 for no complete lines', () => {
            const completed = ['1', '2', '3'];
            expect(checkBingoLines(mockLayout, completed)).toBe(0);
        });
    });

    describe('generateRandomCardLayout', () => {
        it('returns array of 20 items', () => {
            const layout = generateRandomCardLayout();
            expect(layout).toHaveLength(20);
        });

        it('returns shuffled array', () => {
            const layout1 = generateRandomCardLayout();
            const layout2 = generateRandomCardLayout();

            // Very low probability of exact same shuffle
            expect(layout1).not.toEqual(layout2);
        });
    });

    describe('generateSessionCode', () => {
        it('generates code of length 6', () => {
            expect(generateSessionCode()).toHaveLength(6);
        });

        it('generates standard chars', () => {
            expect(generateSessionCode()).toMatch(/^[A-Z0-9]+$/);
        });
    });
});
