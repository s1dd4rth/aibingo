import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BingoGrid from '../components/BingoGrid';
import { GameComponent } from '../lib/game-config';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('../actions/game', () => ({
    markComponentComplete: jest.fn().mockResolvedValue({ success: true, bingoLines: 1 }),
}));

// Mock DetailDrawer to avoid complex nested rendering
jest.mock('../components/DetailDrawer', () => {
    return function MockDetailDrawer({ component, onClose, onComplete, status }: any) {
        return (
            <div data-testid="detail-drawer">
                <h2>{component.name}</h2>
                <button onClick={onClose}>Close</button>
                <button onClick={() => onComplete(component.id)}>Complete</button>
            </div>
        );
    };
});

// Mock BingoCard component
jest.mock('../components/BingoCard', () => {
    return function MockBingoCard({ component, status, onClick }: any) {
        return (
            <div
                data-testid={`bingo-card-${component.id}`}
                onClick={onClick}
                aria-label={`Bingo card for ${component.name}, status: ${status}`}
            >
                {component.name} - {status}
            </div>
        );
    };
});

const mockComponents: GameComponent[] = [
    { id: '1', name: 'Comp 1', period: 'Basics', family: 'Actions', description: 'Desc 1' },
    { id: '2', name: 'Comp 2', period: 'Combos', family: 'Memory', description: 'Desc 2' },
];

jest.mock('../lib/game-config', () => ({
    GAME_COMPONENTS: [
        { id: '1', name: 'Comp 1', period: 'Basics', family: 'Actions', description: 'Desc 1' },
        { id: '2', name: 'Comp 2', period: 'Combos', family: 'Memory', description: 'Desc 2' },
    ],
}));

describe('BingoGrid Component', () => {
    const mockParticipant = {
        id: 'p1',
        cardLayout: ['1', '2'],
        completedComponents: ['1'],
        bingoLines: 0,
        email: 'test@example.com',
        passcode: '1234',
        name: 'Test User',
        unlockedComponentIds: '',
        isCompleted: false,
        joinedAt: new Date(),
        updatedAt: new Date(),
        sessionId: null
    };

    it('renders bingo cards with correct statuses', () => {
        // 1 is completed, 2 is locked (default if not in unlocked list)
        render(<BingoGrid participant={mockParticipant} session={null} />);

        expect(screen.getByTestId('bingo-card-1')).toHaveTextContent('completed');
        expect(screen.getByTestId('bingo-card-2')).toHaveTextContent('locked');
    });

    it('shows unlocked status correctly when provided via session', () => {
        // 2 is explicitly unlocked in session
        render(<BingoGrid
            participant={mockParticipant}
            session={{ unlockedComponents: ['2'] } as any}
        />);

        expect(screen.getByTestId('bingo-card-2')).toHaveTextContent('unlocked');
    });

    it('opens detail drawer when card is clicked', () => {
        render(<BingoGrid participant={mockParticipant} session={null} />);

        fireEvent.click(screen.getByTestId('bingo-card-1'));

        expect(screen.getByTestId('detail-drawer')).toBeInTheDocument();
        expect(screen.getByText('Comp 1')).toBeInTheDocument();
    });
});
