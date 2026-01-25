import { getSession } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function GameLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    return (
        <div className="min-h-screen pb-20">
            <header className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5 mx-auto">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        AI Bingo Quest
                    </div>
                    {/* We could add User Profile / Progress Summary here */}
                </div>
            </header>
            <main className="pt-24 px-4 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
