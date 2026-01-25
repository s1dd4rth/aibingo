import { GAME_COMPONENTS, GameComponent } from './game-config';

// Group components by period for facilitator dashboard
export const COMPONENTS_BY_PERIOD = {
    basics: GAME_COMPONENTS.filter(c => c.period === 'Basics'),
    combos: GAME_COMPONENTS.filter(c => c.period === 'Combos'),
    production: GAME_COMPONENTS.filter(c => c.period === 'Production'),
    future: GAME_COMPONENTS.filter(c => c.period === 'Future'),
};

// Export all components in a flat array
export { GAME_COMPONENTS } from './game-config';
export type { GameComponent } from './game-config';
