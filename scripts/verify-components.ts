import { GAME_COMPONENTS } from '../src/lib/game-config';
import { generateRandomCardLayout } from '../src/lib/bingo';

const layoutIds = generateRandomCardLayout();
const configIds = new Set(GAME_COMPONENTS.map(c => c.id));

console.log('Layout IDs count:', layoutIds.length);
console.log('Config IDs count:', configIds.size);

const missing = layoutIds.filter(id => !configIds.has(id));

if (missing.length > 0) {
    console.error('MISSING IDs in game-config:', missing);
} else {
    console.log('All layout IDs exist in game-config!');
}

const extra = GAME_COMPONENTS.filter(c => !layoutIds.includes(c.id)).map(c => c.id);
console.log('Components in config NOT in layout:', extra);
