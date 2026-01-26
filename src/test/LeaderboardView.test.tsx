import { render, screen, waitFor } from '@testing-library/react';
import LeaderboardView from '../components/LeaderboardView';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/link', () => {
    return ({ children }: { children: React.ReactNode }) => <span>{children}</span>;
});

// Mock getLeaderboard action
jest.mock('../actions/leaderboard', () => ({
    getLeaderboard: jest.fn().mockResolvedValue({
        entries: [
            { rank: 1, name: 'Updated P1', score: 10, bingoLines: 2, isCompleted: false }
        ],
        sessionCode: 'TEST12'
    })
}));

describe('LeaderboardView Component', () => {
    const mockInitialData = {
        entries: [
            { rank: 1, name: 'Player 1', score: 5, bingoLines: 1, isCompleted: false },
            { rank: 2, name: 'Player 2', score: 20, bingoLines: 0, isCompleted: true }
        ],
        sessionCode: 'TEST12'
    };

    it('renders initial leaderboard data properly', () => {
        render(<LeaderboardView initialData={mockInitialData} />);

        expect(screen.getByText('Player 1')).toBeInTheDocument();
        expect(screen.getByText('Player 2')).toBeInTheDocument();
        expect(screen.getByText('5 / 20')).toBeInTheDocument();
        expect(screen.getByText('1 🎯')).toBeInTheDocument();
        expect(screen.getByText(/Session: TEST12/i)).toBeInTheDocument();
    });

    it('shows completed status correctly', () => {
        render(<LeaderboardView initialData={mockInitialData} />);

        // Ptyer 2 is completed
        const doneElement = screen.getByText('Done');
        expect(doneElement).toBeInTheDocument();
        expect(doneElement).toHaveClass('text-green-400');
    });

    it('shows empty state message when no entries', () => {
        render(<LeaderboardView initialData={{ entries: [], sessionCode: 'TEST12' }} />);

        expect(screen.getByText(/No players yet/i)).toBeInTheDocument();
    });
});
