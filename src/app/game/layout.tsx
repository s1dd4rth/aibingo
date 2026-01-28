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
            <main className="max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
}
