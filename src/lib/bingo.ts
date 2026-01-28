/**
 * Generate a random card layout for a participant
 * Returns an array of 20 component IDs in random order
 */
export function generateRandomCardLayout(): string[] {
    // All 20 component IDs in pedagogical order
    const componentIds = [
        // Basics (5)
        'prompting',
        'embeddings',
        'chains',
        'rules-regex',
        'llms',

        // Combos (5)
        'function-calling',
        'vector-db',
        'rag',
        'guardrails',
        'multimodal',

        // Production (5)
        'agents',
        'fine-tuning',
        'frameworks',
        'red-teaming',
        'small-models',

        // Future (5)
        'multi-agent',
        'synthetic-data',
        'flow-engineering',
        'interpretability',
        'evaluator', // Keeping Evaluator to maintain 20 cards (5x4 grid)
    ];

    // Fisher-Yates shuffle algorithm
    const shuffled = [...componentIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Check how many bingo lines are completed
 * Card is 5 columns x 4 rows
 * 
 * @param cardLayout - Array of 20 component IDs in player's card order
 * @param completedIds - Array of component IDs that are marked complete
 * @returns Number of completed bingo lines (rows, columns, diagonals)
 */
export function checkBingoLines(cardLayout: string[], completedIds: string[]): number {
    const COLS = 5;
    const ROWS = 4;

    // Create a Set for O(1) lookup
    const completedSet = new Set(completedIds);

    // Create a 2D grid representation
    const grid: boolean[][] = [];
    for (let row = 0; row < ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < COLS; col++) {
            const index = row * COLS + col;
            grid[row][col] = completedSet.has(cardLayout[index]);
        }
    }

    let bingoCount = 0;

    // Check rows (4 rows)
    for (let row = 0; row < ROWS; row++) {
        if (grid[row].every(cell => cell)) {
            bingoCount++;
        }
    }

    // Check columns (5 columns)
    for (let col = 0; col < COLS; col++) {
        if (grid.every(row => row[col])) {
            bingoCount++;
        }
    }

    // Check diagonal (top-left to bottom-right)
    // Only works for 4x4, so we check the first 4 columns
    if (ROWS === 4 && COLS >= 4) {
        if (grid[0][0] && grid[1][1] && grid[2][2] && grid[3][3]) {
            bingoCount++;
        }
    }

    // Check diagonal (top-right to bottom-left)
    // Using the last 4 columns
    if (ROWS === 4 && COLS >= 4) {
        if (grid[0][COLS - 1] && grid[1][COLS - 2] && grid[2][COLS - 3] && grid[3][COLS - 4]) {
            bingoCount++;
        }
    }

    return bingoCount;
}

/**
 * Generate a unique 6-character session code
 */
export function generateSessionCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789'; // Removed ambiguous chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
