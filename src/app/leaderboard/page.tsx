import { getLeaderboard } from '@/actions/leaderboard';
import LeaderboardView from '@/components/LeaderboardView';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
    const data = await getLeaderboard();
    return <LeaderboardView initialData={data} />;
}
