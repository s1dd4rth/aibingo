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
                    {state.session
                        ? "Complete components as they're unlocked by your facilitator"
                        : "Join a session to start learning with a facilitator"}
                </p>
            </div>

            <SessionJoin
                currentSession={state.session?.code || state.participant.passcode}
                participantId={state.participant.id}
            />
            <ColabSetup />

            <BingoGrid
                participant={state.participant}
                session={state.session ? {
                    id: state.session.id,
                    unlockedComponents: state.session.unlockedComponents
                } : null}
            />
        </div>
    );
}
