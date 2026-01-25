import SessionJoin from '@/components/SessionJoin';
import ColabSetup from '@/components/ColabSetup';
import { getGameState } from '@/actions/game';
import BingoGrid from '@/components/BingoGrid';
import { redirect } from 'next/navigation';

export default async function GamePage() {
    const state = await getGameState();

    if ('error' in state) {
        // Handle error (e.g. user deleted but session exists)
        redirect('/');
    }

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white">Your Learning Path</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Complete modules to unlock stamps. Fill the grid to master the full AI stack.
                </p>
            </div>

            <SessionJoin currentSession={state.participant.passcode} />
            <ColabSetup />

            <BingoGrid
                participant={state.participant}
                config={state.config}
            />
        </div>
    );
}
