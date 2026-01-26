import { render, screen, fireEvent } from '@testing-library/react';
import SessionJoin from '../components/SessionJoin';
import '@testing-library/jest-dom';

// Mock the server action
jest.mock('../actions/session', () => ({
    joinSession: jest.fn(),
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: jest.fn(),
    }),
}));

describe('SessionJoin Component', () => {
    it('renders correctly when not in a session', () => {
        render(<SessionJoin />);

        expect(screen.getByText('Live Workshop Session')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter Session Code (e.g., ABC123)')).toBeInTheDocument();
    });

    it('renders correctly when in a session', () => {
        const sessionCode = 'TEST12';
        render(<SessionJoin currentSession={sessionCode} />);

        expect(screen.getByText(/Connected to session: TEST12/i)).toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Enter Session Code (e.g., ABC123)')).not.toBeInTheDocument();
    });

    it('disables join button when input is empty', () => {
        render(<SessionJoin />);

        const joinButton = screen.getByRole('button', { name: /join/i });
        expect(joinButton).toBeDisabled();
    });

    it('enables join button when 6 characters are entered', () => {
        render(<SessionJoin />);

        const input = screen.getByPlaceholderText('Enter Session Code (e.g., ABC123)');
        fireEvent.change(input, { target: { value: 'ABC123' } });

        const joinButton = screen.getByRole('button', { name: /join/i });
        expect(joinButton).not.toBeDisabled();
    });
});
