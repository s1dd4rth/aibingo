import SessionJoin from '@/components/SessionJoin';
import ColabSetup from '@/components/ColabSetup';
import { getGameState } from '@/actions/game';
import BingoGrid from '@/components/BingoGrid';
import BonusGrid from '@/components/BonusGrid';
import BrandHeader from '@/components/BrandHeader';
import { redirect } from 'next/navigation';

export default async function GamePage() {
    const state = await getGameState();

    if ('error' in state) {
        // Handle error (e.g. user deleted but session exists)
        redirect('/');
    }

    return (
        <div className="space-y-8">
            <BrandHeader
                title="Your Learning Path"
                rightElement={null} // Session disconnect is inside SessionJoin for now, can move later if needed
            />

            <div className="text-center space-y-2 pt-4">
                {/* Header Title moved to BrandHeader */}
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

            {/* Bonus Cards Section */}
            {state.session && (
                <BonusGrid
                    participant={{
                        id: state.participant.id,
                        completedComponents: state.participant.completedComponents,
                        completedBonusCards: state.participant.completedBonusCards,
                        bonusPoints: state.participant.bonusPoints,
                        bingoLines: state.participant.bingoLines,
                    }}
                    session={{
                        id: state.session.id,
                        unlockedBonusCards: state.session.unlockedBonusCards,
                        bonusEnabled: state.session.bonusEnabled,
                    }}
                />
            )}
        </div>
    );
}
